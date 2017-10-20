---
layout: post
title: "Context Dependency Injection (CDI)"
description: ""
category: 
tags: [CDI]
---
{% include JB/setup %}

JSR 299

# L’injection de dépendance

## Qu’est ce que c’est
C’est le principe de programmation qui fait qu’une instance de classe qui utilise une instance d’une autre classe **n’est pas responsable de la création** de cette dernière.  
Cette création est déportée dans une factory ou un conteneur d’injection de dépendances (comme Spring par exemple).

## Pourquoi faire

  - L’injection de dépendances rend les **test unitaires beaucoup plus faciles** permettant de remplacer les dépendances par des mocks.

  - L’injection de dépendances **favorise un couplage lache** en séparant l’utilisation d’une dépendance de sa construction.

  
# JSR 299

CDI correspond à la JSR 299 qui permet :

  - d’ **unifier la manière de faire de l’injection de dépendances** dans le mode JEE (Serveur d’application, Spring, Guice, Seam).
  
  - de faire de l’injection de dépendances _**type safe**_.

  - d’utiliser la notion de _scope_ sur les objets injectés (statefull objects).

  - d’injecter directement des EJB comme _managed beans_ JSF.  

>L’implementation de reference (RI) de CDI est **[Weld](http://weld.cdi-spec.org/)**.
{: .information}

#CDI - Typage fort

Basé sur les annotations, CDI permet de détecter les problèmes d’injection de dépendances à la compilation (et non au runtime comme c’est le cas avec de l’injection basée sur des chaines de caractères).

#Les beans JEE 6 

Il existe un besoin d’unifier la définition d’un bean car on a des beans Spring, JSF, Guice, EJB, Seam, ...  
<br>
JEE 6 propose une définition d’un bean comme :

  - étant un POJO géré (managé) par un containeur
  - supportant : 
     - un cycle de vie managé (@PostConstruct, @PreDestroy)
     - l’injection de resource(@Resource)
     - les intercepteurs (@Interceptors, @AroundInvoke)

## Différence entre les beans EJB, CDI, REST ...

TOus sont des beans JEE 6 (ils ont les propriétés décrites ci-dessus). Mais ils aussi des particularités qui les différencient les uns des autres :

  - un bean EJB supporte les transactions, ajoute de la securité, de la persistence et est _thread safe_
  - un bean REST supporte HTTP
  - un bean CDI supporte un ensemble de service propre à CDI. 


# Decouverte automatique des beans CDI

Pour que des pojos puissent être perçu par le conteneur comme des beans CDI, il faut que l’archive les contenant possède un fichier _**beans.xml**_ dans:
  
  - le répertoire _**/WEB-INF**_ pour un _**WAR**_
  - le répertoire _**/META-INF**_ pour un _**JAR**_

>_**beans.xml**_ ne sert pas à déclarer les beans comme dans Spring.  **Il peut être vide**, l’archive sera quand même scannée pour découvrir les beans.
{: .attention}

# Injection

L’injection à lieu dans un « point d’injection », qui peut être :

  - un champ
  - une méthode

## Injection dans un champ
    
    @Inject <Java-Type> <variable-name>
    
exemple:

    class Account {

        @Inject User user;
    
        ...
    }
    

## Injection dans une méthode

### Constructeur
Permet notament de construre des objets **immutables**.

    class Account {
    
        private User user;

        @Inject 
        public MyClass(User user){
        
           this.user = user;
        }
        
        ...
    }

### Initializer

### Setter

### Producer

### Observer


# Qualifier

Pour un type de bean à injecter, il peut y avoir plusieurs implémentations correspondant à ce type. Un -**qualifier**_ est une annotation qui permet de définir le type de l’implémentation à injecter que le conteneur doit choisir.

##_built-in qualifier_

CDI propose plusieurs _qualifiers_ déjà prés à être utilisés :

  - @Named
  - @Default

  - @New
  - @Any
    
