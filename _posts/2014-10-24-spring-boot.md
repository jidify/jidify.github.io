---
layout: post
title: "Spring Boot"
description: ""
category: 
tags: [Spring, Spring boot]
---
{% include JB/setup %}

#Détection & création des beans

##Mécanisme standart

![spring bean factory](/assets/images/spring/spring_bean_factory.png)

Spring instancie les beans, en se basant sur leurs définitions (fichiers XML, annotations, ...), grâce aux multiples implémentations de [BeanFactory](http://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/BeanFactory.html).  
_BeanFactory_ agit également comme un **référentiel des beans de l'application** et les utilisateurs de ces beans doivent effectuer un _**lookup**_ (par nom, type, ...) pour récupérer une référence du bean désiré. Ce _lookup_ est souvent masqué à l'utilisateur par le mécanisme d'**injection de dépendances (D.I)** proposé par Spring.

> **BeanFactory vs ApplicationContext**  
En gros, un _ApplicationContext_ est une super _Beanfactory_, c'est à dire qu'il fait tous ce que fait une _Beanfactory_, mais propose d'autres actions sur les beans.  
<br>
Bean Factory :  
  - Bean instantiation/wiring
<br>
<br>
Application Context :  
  - Bean instantiation/wiring  
  - Automatic BeanPostProcessor registration  
  - Automatic BeanFactoryPostProcessor registration  
  - Convenient MessageSource access (for i18n)  
  - ApplicationEvent publication
<br>
<br>
voir complément dans la [documentation Spring](http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#context-introduction-ctx-vs-beanfactory).
{: .information}

##Avec Spring Boot
En activant le mode debug `-- debug`, on remarque les traces suivantes :

![spring auto-configuration-positive-matches](/assets/images/spring/spring-auto-configarution-positive-matches.png)

![spring auto-configuration-negative-matches](/assets/images/spring/spring-auto-configarution-negative-matches.png)


Spring boot va prendre en charge automatiquement la **partie "configuration des beans"**, en se basant sur la **présence (ou non) de classes, beans dans le CLASSPATH** de l'application.  
Dans les traces, on trouve la section :

  - _**Positive Matches**_ indiquant les classes de configuration qui **ont étées prise en comptes** car elles répondaient aux conditions (_@ConditionalOnClass_, _@ConditionalOnMissingBean_, _SpEL expression_, _..._).

  - _**Negative Matches**_ indiquant les classes de configuration qui **n'ont pas étées prise en comptes** car elles ne pas répondaient aux conditions.

>Pour que cette prise en compte automatique des classes annotées avec _@Configuration_ ait lieu, il faut ajouter l'annotation _**@EnableAutoConfiguration**_.   
<br> 
Cette annotation est placée sur la classe fournit en paramètre **[_org.springframework.boot.SpringApplication.(run(...)_](http://docs.spring.io/autorepo/docs/spring-boot/current/api/org/springframework/boot/SpringApplication.html)**,  permettant de _bootstraper_ depuis un méthode _main_ une application Spring.
{: .information}

	...
	@EnableAutoConfiguration
	public class Application {

	    public static void main(String[] args) {
	        SpringApplication.run(Application.class, args);
	    }
	}
{: .information}
>
{: .information}

En affichant le code source d'une classe du package d'autoconfiguration (_**spring-boot-autoconfigure-X-X-X-RELEASE.jar**_) dans un IDE,  on voit facilement si une classe de configuration est prise en compte ou non.  
<br>
<br>
**PAS DE ROUGE --> la configuration est prise en compte**![spring auto-configuration-positive-matches-in-IDE](/assets/images/spring/spring-auto-configarution-positive-matches-in-IDE.png)  
**Toutes les conditions sont vérifiées**, la classe _AopAutoConfiguration_ se trouve dans la section _**positive matches**_.  
<br>
<br>
**DU ROUGE --> la configuration n'est pas prise en compte**{: style="color: red"} 
![spring auto-configuration-negative-matches-in-IDE](/assets/images/spring/spring-auto-configarution-negative-matches-in-IDE.png)    
_**@CondionalOnClass**_ **n'est pas vérifiée**, la classe _SecurityAutoConfiguration_ se trouve dans la section _**negative matches**_.

#Profil

### Définir un profil

Il est possible de définir plusieurs configuration de l'application en définissant un fichier `application.properties` **spécifique à un profil**. Il suffit de créer des fichiers `application-{profile}.properties` pour chaque profils.

>l'annotation _**@profil**_ peut être placée au niveau des classes _**@Configuration**_ et _**@Component**_.  
<br>
Elle peut également être placée au niveau des methodes annotées avec _**@Bean**_ (dans une classe _@Configuration_).
{: .information}

**Références:**  
  - [Springboot - profil & application.properties](http://docs.spring.io/spring-boot/docs/1.1.8.RELEASE/reference/htmlsingle/#boot-features-external-config-profile-specific-properties)


### Activer un profil

L'activation d'un (des) profil(s) peut se faire :

  - en commande `-Dspring.profiles.active="profile1,profile2"`

  - avec l'annotation `@ActiveProfiles( profiles = {"profile1,profile2"} )`

 - en configurant les paramètres de la _DispatcherServlet_ de Spring MVC  (in web.xml):
 
		 <servlet>
		      <servlet-name>dispatcher</servlet-name>
		      <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
		      <init-param>
		          <param-name>spring.profiles.active</param-name>
		          <param-value>production</param-value>
		      </init-param>
		  </servlet>
  


### Aggréger des profils

un fichier `application-{profile}.properties` peut inclure les propriétés d'autres profil en renseignant la propriété 'spring.profiles.include` :

    spring.profiles.include: dev,dbFile
   
    
>Les propriétés du fichier `application.properties` sont **toujours prise en compte**, quelquesoit le profil activé.  
Elles peuvent cependant **être modifiées** par les autres **profils inclus**.   