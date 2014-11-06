---
layout: post
title: "Authentification avec JWT"
description: ""
category: 
tags: [jwt, json web token, angularJS, spring security]
---
{% include JB/setup %}


#Json Web Token

JWT (prononcé "jot") est une **authentification stateless** basée sur l'échange d'un token entre le client et le serveur. Le token contient les informations suffisantes : 

  - pour **identifier** le client (le token est bien celui qui à été remis lors de l'authentification)
 - pour **autoriser** le client (le token contient les droits du client)


 _voir et tester ses jwt sur [jwt.io](http://jwt.io/)_
 
#Mise en place coté serveur

L'authentification/autorisation est mise en place avec **spring security**.

**2 points d'entrée** pour l'authentification avec JWT (ou plus généralement avec un token)

!["Entrypoints"](/assets/images/jwt/jwt_entrypoints.png)

##AuthenticationController
L'_**AuthenticationController**_ à la charge de **créer le token** àprés avoir authentifié l'utilisateur.  

###Invocation
Ce controller est invoqué **explicitement** depuis le client **par une URL** :

    @RestController
    @RequestMapping(value = "/api")
    public class AuthenticationController {
   
        @Autowired
        private AuthenticationManager authenticationManager;

        @Autowired
        private TokenProcessor tokenProcessor;


        @RequestMapping(method = RequestMethod.POST, value = "/login")
        public User findUserByEmail(@RequestParam(value = "email") String email, 
                                    @RequestParam(value = "pswrd") String password, HttpServletResponse response){
          
                      ....   
        }
    }
    
ici, l'URL sera du type `https://[host]:[port]/context/api/login`
   
   
###Implémentation

 L'_**AuthenticationController**_  doit :
 
   - **authentifier le client** (login/password par exemple)
   - **créer le token JWT** et l'ajouter dans le header de la reponse HTTP  

L'authentification se base sur le login/password fourni par l'utilisateur et utilise le mécanisme classique de Spring Security:
 
    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(email, password);
    Authentication authentication = this.authenticationManager.authenticate(token);
       
    if (authentication != null && authentication.isAuthenticated()) {   
        
        // création du token JWT    
        
    }
    
>Attention, le _token_ du type  _UsernamePasswordAuthenticationToken_ fait partie de **l'API de Spring Security** et **n'a rien à voir avec le token JWT** echangé entre le client et le serveur via HTTP !!
{: .attention}

Toutes les opérations concernant JWT sont déléguées à la classe _**TokenProcessor**_. Donc, pour la création du token JWT, notre  controleur appelle la méthode _createToken_, puis inserre le nouveau token dans le header de la réponse HTTP :

    if (authentication != null && authentication.isAuthenticated()) {
          
        org.springframework.security.core.userdetails.User principal = (org.springframework.security.core.userdetails.User)authentication.getPrincipal();
          
        String jwtToken = this.tokenProcessor.createToken(principal);
          response.setHeader(XAuthTokenFilter.xAuthTokenHeaderName, jwtToken);
                  
        ...     
    }    
   
    return ...   
    


  
##XAuthTokenFilter

_**XAuthTokenFilter**_ à la charge de vérifier le token et de renseigner le contexte de securité de Spring Security.  
On utilise un _filtre_ car on est dans le cas d'un traitement transverse, qui doit intervenir pour toutes les requètes HTTP.

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
	                     JFilterChain filterChain) throws IOException, ServletException {
		try {
			HttpServletRequest httpServletRequest = (HttpServletRequest) request;
			String token = httpServletRequest.getHeader(xAuthTokenHeaderName);

			//if there is a token
            if(StringUtils.hasText(token)){
				// we recover user's security information 
                UsernamePasswordAuthenticationToken authToken = tokenProcessor.extractCredentialsFromToken(token);
				
                //and add them to the Spring Security context
                SecurityContext sc = SecurityContextHolder.getContext();
				sc.setAuthentication(authToken);
			}
			
			filterChain.doFilter(request, response);

		} catch (TamperTokenException tex) {
			log.warn("User try to access services with a tamper token", tex);
		}
	}

Ce filtre doit être **insérer** dans la _chaine de filtre_ proposée pas spring security :

	  @Override
	   protected void configure(HttpSecurity http) throws Exception {
	      http.
	       ....
	       .and().addFilterBefore( this.xAuthTokenFilter, UsernamePasswordAuthenticationFilter.class)
	      ....
	   }

ce qui place notre filtre tel **qu'on passe toujours par lui en premier lieu** : 

![jwt chain filter](/assets/images/jwt/jwt_chain_filter_order.png)

Si il n'y a **pas de token, le filtre ne fait rien**, et la requète suit son cours normale.


##TokenProcessor

C'est la classe qui prend en charge toutes les opérations directes effectuées sur le token JWT (creation, configuration, extraction, verification).  

J'ai utilisé la librairie _**[nimbus-jose-jwt](http://connect2id.com/products/nimbus-jose-jwt)**_ comme implémentation des spécifications **Javascript Object Signing and Encryption (JOSE)** et **JSON Web Token (JWT)** - car elle repondait à mon besoin et était de loin **la mieux documentée**.  

J'ai utiliser le chiffrage **HMAC** qui est symétrique, donc sans clé publique (client et serveur sont sensé posséder la clé privée), **MAIS sans passer la clé privé au client!!**.  
En effet, Je n'ai pas besoin de fournir sous forme cryptée des informations aux clients. Le chiffrage me permet juste de **valider le token COTE SERVEUR** comme étant bien un token original (créer par le serveur et non-modifié). 

    @Component
    public class TokenProcessor {
        ....
        
        // our private key
        private byte[] sharedKey = new byte[32]; // 32 bytes = 256 bits
        // our HMAC signer
        private JWSSigner signer;
        
        public TokenProcessor() {
		    SecureRandom random = new SecureRandom();
		    random.nextBytes(this.sharedKey);
		    
		    // Create the signer
		    this.signer = new MACSigner(this.sharedKey);
		}
		...
	}

Le _TokenProcessor_ est un singleton (_@Component_).  
La clé privée est générée avec un _SecureRandom_ Java et fait **256 bits (soit 32 bytes)**. Nous l'utiliserons donc plus tard pour _signer_ et _parser_ un algorithme de hachage SHA-256.   

###Création du token JWT

La création se fera à partir d'un _**[org.springframework.security.core.userdetails](http://docs.spring.io/spring-security/site/docs/current/apidocs/org/springframework/security/core/userdetails/package-summary.html)**_ qui est typiquement la classe récupérer par spring security aprés une authentification via **DAO + Base de données**.  
En sortie, nous aurons un token JWT contenant :

  - l'**identifiant** (ou login) de l'utilisateur
  - les **rôles** de l'utilisateur
  - une **durée d'expiration** du token (12 heures)

On utilise pour cela la classe _JWTClaimsSet_:

    JWTClaimsSet claimsSet = new JWTClaimsSet();
    ...
    // set the userID
    claimsSet.setSubject(user.getUsername());

	//set expiration to (12 heures)
    claimsSet.setExpirationTime(new Date(new Date().getTime() + 1000 * 60 * 60 * 12));
    
    //set roles
    claimsSet.setCustomClaims(rolesMap);

On remarque que les **_"rôles"_ ne sont pas normalisés** et doivent être renseignés en utilisant un _**customClaim**_.

>Je n'ai pas mis en place de mécanisme de raffraichissement de token. L'utilisateur devra donc se reconnecter toutes les 12 heures.  
<br>
Ce mecanisme, décrit [ici](), implique le développement d'un _[delegation endpoint](https://docs.auth0.com/auth-api#post--delegation)_ coté serveur.  
La partie cliente pourra s'appuyer sur la librairie [angular-jwt](https://github.com/auth0/angular-jwt)  
(_voir aussi : [Handling JWTs on Angular is finally easier!](https://auth0.com/blog/2014/10/01/handling-jwts-on-angular-is-finally-easier/)_).  
{: .warning}


Ensuite, on construit notre JWT token :

  1. définition de l'alghorithme
  2. signature du token
  3. serialisé sous forme de _String_
  
  
	// create our JWT
	SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);

	try {
	    // signed our JWT
	    signedJWT.sign(signer);
	    
	    // Serialise JWT object to compact format
	    token = signedJWT.serialize();
		
	} catch (JOSEException e) {
		...
	}
	
On retrouve notre algorithme de hachage SHA-256 `JWSAlgorithm.HS256`.




###Récupération des informations client depuis le token JWT

La récupération des informations client depuis le token JWT consiste à :

  1. dé-serialisé le token JWT (sous forme de _String_)
  2. vérifier la signature du token
  3. créer une instance de _UsernamePasswordAuthenticationToken_ représentant l'utilisateur d'un point de vue sécurité.

	 SignedJWT signedJWT;
    
    // first, we verify the signature to validate that the token as not been tampered
    try {
       // "de-serialized" the JWT
       signedJWT = SignedJWT.parse(jwtToken);
    
       // verify the signature of the token
       JWSVerifier verifier = new MACVerifier(this.sharedKey); // as MACVerifier.verify is synchronized,
                                                                 // we build a new verifier for each request
    
       boolean verifiedSignature = signedJWT.verify(verifier);
       if (!verifiedSignature) {
           // if the signature has been tampered, we stop and alert !!
           throw new TamperTokenException("Signature has been tamper !!");
       }
    
       //verify the expiration date
       Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
       if(expirationTime.getTime() < System.currentTimeMillis()){
           throw new JwtException("The token has expired !! ");
       }
    
     } catch (ParseException | JOSEException e) {
        throw new JwtException("Failed to recover data from token!!", e);
     }
    
     //second, we create the Spring securityContextToken
     return buildSecurityContextTokenFromJWT(signedJWT);
     
     
Rien de particulier, si ce ,'est que nous construisons un nouveau _verifier_ à chaque reqète pour éviter les problémes de synchronisation de thread  `WSVerifier verifier = new MACVerifier(this.sharedKey);`.  
<br>
La méthodes `buildSecurityContextTokenFromJWT(...)` récupére les données dans l'instance de _SignedJWT_ et les injecte dans l'instance de _UsernamePasswordAuthenticationToken_:

    // recover userID
    userID = signedJWT.getJWTClaimsSet().getSubject();

    // recover roles
    String roles = (String) signedJWT.getJWTClaimsSet().getCustomClaims().get(ROLES_KEY);
    authorities = Stream.of(roles.split(ROLE_SEPARATOR_ESCAPED))
                            .map(role -> new SimpleGrantedAuthority(role))
                            .collect(Collectors.toList());

    ...

    return new UsernamePasswordAuthenticationToken(userID,
                                                   "",           // don't need password
                                                   authorities);
  
  
  Comme je n'ai plus besoin du password, je le positionne à `""`. 
  
  
#Mise en place coté client

La partie cliente sera en charge:

  1. d'invoquer l'authentification de l'utilisateur en fournissant un login/password et de récupérer le token JWT
  2. d'inserer le token JWT dans chaque requète HTPP envoyée au serveur.
  3. Gérer les erreurs 401

Quasiment tout se passe dans le service _loginService_:
  
    function LoginService($http, $cookieStore, authService, props) {

        this.login = function (email, password) {
            // REST operation with $http
            $http({
                method: 'POST',
                url: props.URL_REMOTE + '/api/login',
                data: $.param({email: email, pswrd: password}),
                ignoreAuthModule: true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .success(function (data, status, headers, config) {
                    var user = data;

                    var token = headers(props.TOKEN_HEADER_NAME);

                    $http.defaults.headers.common[ props.TOKEN_HEADER_NAME ] = token;
                    $cookieStore.put(props.TOKEN_HEADER_NAME, token);
                    authService.loginConfirmed();

                 });
        };
    }
    
    
Comme on le voit, la création du token est déclencher par l'appel à l'authentification `api/login`, et on le récupère **dans le header de la reponse**: 

    var token = headers(props.TOKEN_HEADER_NAME);
         
 On configure ensuite [$http](https://docs.angularjs.org/api/ng/service/$http) pour que le token soit **ajouté dans le header de chaque requète envoyée**:
 
      $http.defaults.headers.common[ props.TOKEN_HEADER_NAME ] = token;
      
Pour pouvoir **récupérer le token aprés un rafraichissement ou une fermeture du navigateur**, on stoke le token dans un cookie (on peut aussi le stocker dans le _localStorage_ du navigateur):

    $cookieStore.put(props.TOKEN_HEADER_NAME, token);

et au démarrage de l'application (_.run()_ d'angular), on vérifie si le token est présent. Si c'est le cas, on configure à nouveau _http_ pour ajouter le token à chaque requète:

    var app = angular.module('relanes', ['ngRoute', 'ngResource', 'ngCookies'])
    ....
    .run(['$rootScope', '$http', '$cookieStore', 'props', function($rootScope, $http, $cookieStore, props){
        var token = $cookieStore.get(props.TOKEN_HEADER_NAME);

        if (token !== undefined) {
            $http.defaults.headers.common[props.TOKEN_HEADER_NAME] = token; // ICI, on le récupère dans un cookie
        }
        ...
    }]) 
    
**Pour se déloguer**, il suffit de supprimer le token dans la configuration de _$http_ et du stokage (ici, dans un cookie): 

    delete $http.defaults.headers.common[props.TOKEN_HEADER_NAME];
    $cookieStore.remove(props.TOKEN_HEADER_NAME);
    
    
##Gestion des 401
Utilisation du module [angular-http-auth](https://github.com/witoldsz/angular-http-auth).  


    this.login = function(email, password){
        // REST operation with $http
        $http({
            method: 'POST',
            url: props.URL_REMOTE + '/api/login',
            data: $.param({email: email, pswrd: password}),
            ignoreAuthModule: true,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .success(function(data, status, headers, config) {
           ...
           authService.loginConfirmed();
        });
    };

>ATTENTION  
Par defaut, le module HTTP rejoue les requètes qui ont échouées pour des raison d'authentification.  
Pour **ne pas rejouer les requetes de login (en cas d'echec)**, il faut ajouter le parametre `ignoreAuthModule: true`  dans la **configuration de $http envoyant les requètes de login**.
{: .warning}


A noter l'appel de `authService.loginConfirmed()` en cas de succes, qui emettra l'event _auth-loginConfirmed_, attrapé au niveau du $rootScope :

     angular.module(...)
        .run(function() {
            ...
            $rootScope.$on('event:auth-loginConfirmed', function() {
                loginModal.close();
                loginModal = null;
            });
        });

##Mire de Login sous forme modale 

On utilise les _modal_ du module [Angular-ui-bootstrap](http://angular-ui.github.io/bootstrap/#/modal).  
<br>
j'utilise la methode `result()` pour _reseter_ la _modal_ lorsque l'utisateur clique en dehors de la modal :

	loginModal = $modal.open({...});
	loginModal.result.then( function(){},  //si je ne mets pas cette fonction vide, ça ne marche pas :(
	        function(reason){
	           loginModal = null;
	        }
	     );
  
**ATTENTION :**   
La notation **"controller as" directement** dans la configuration de la modal **ne fonctionnait pas bien** lors de ce developpement (Version: 0.11.0 - 2014-05-01).

    loginModal = $modal.open({
       templateUrl: 'static/partials/login.tpl.html'
       controller: 'LoginController as loginCtrl'
    });

j'ai du **ajouté le controleur dans le partial** car  avec la notation ci-dessus, je n'arrive pas à invoquer le `$setPristine(true)`!!

    //code JS:
    loginModal = $modal.open({
       templateUrl: 'static/partials/login.tpl.html'
    });

    //dans le partial HTML:
    <div ng-controller="LoginController as loginCtrl">
        ...
    </div>
