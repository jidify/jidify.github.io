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

Toutes les opérations concernant JWT sont déléguées à la classe _**TokenProcessor**_. Donc, pour la création du token JWT, notre  controleur appelle la méthode _createToken__, puis inserre le nouveau token dans le header de la réponse HTTP :

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
En effet, Je n'ai pas besoin de fournir sous forme cryptée des informations aux clients. Le chiffrage me permet juste de **valider le token COTE SERVEUR** comme étant bien un token un original (créer par le serveur et non-modifié). 

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

Le _TokenProcessor_ est un singleton (_@Component_). La clé privée est générée avec un _SecureRandom_ Java et fait **256 bits (soit 32 bytes)**. Nous utiliserons donc plus tard pour _signer_ et _parser_ un algorithme de hachage SHA-256.   

###Création du token JWT

La création se fera à partir d'un _**[org.springframework.security.core.userdetails](http://docs.spring.io/spring-security/site/docs/current/apidocs/org/springframework/security/core/userdetails/package-summary.html)**_ qui est typiquement la classe récupérer par spring security aprés une authentification via **DAO + Base de données**.  
En sortie, nous aurons un token JWT contenant :

  - l'**identifiant** (ou login) de l'utilisateur
  - les **rôles** de l'utilisateur
  - une **durée d'expiration** du token (30 min)

On utilise pour cela la classe _JWTClaimsSet_:

    JWTClaimsSet claimsSet = new JWTClaimsSet();
    ...
    // set the userID
    claimsSet.setSubject(user.getUsername());

	//set expiration to 30 min
    claimsSet.setExpirationTime(new Date(new Date().getTime() + 1000 * 60 * 30));
    
    //set roles
    claimsSet.setCustomClaims(rolesMap);

On remarque que les **_roles_ ne sont pas normalisés** et doivent être renseignés en utilisant un _**customClaim**_.

<br>
Ensuite, on construit notre JWT token :

  1. définition de l'alghorithme
  2. signé
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


