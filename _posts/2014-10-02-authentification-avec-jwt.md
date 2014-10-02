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
	                     FilterChain filterChain) throws IOException, ServletException {
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


>En réalité, **on passe toujours par le filtre** charger de vérifier le token en premier lieu. Si il n'y à **pas de token, il ne fait rien**, et la requète suis son cours normale.
{: .warning}