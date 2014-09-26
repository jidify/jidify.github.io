---
layout: post
title: "Java   Lambda"
description: ""
category: 
tags: [java 8, lambda]
---
{% include JB/setup %}

#Pourquoi les lambdas en Java
  1. Plus concis
  2. Orienté programmation fonctionnelle
  3. Nécessaire aux "streams"

#Qu'est-ce qu'une lambda

Une lambda **ressemble à une fonction** mais est en fait **une instance d'une inner class** qui implémente une **interface contenant une seule méthode abstraite**. 

>Une interface n'ayant qu'une seule methode s'appelle une **"interfaces fonctionnelle"** ou une **"Single Abstract Method Interface"**.
{: .information}

soit, l'utilisation d'une classe annonyme (java 7): 

    new SomeInterface() {
       
       @Override
       public SomeType someMethod(String arg1, String arg2) {
          body
       }
    }
    
devient avec la syntaxe des lambda (java 8):

    (String arg1, String arg2) -> { body }
    
#Syntaxe simplifiée    
    
    
##Inference de type

Dans l'exemple ci-dessus :

    (String arg1, String arg2) -> { body }
    
On précise le type des arguments, or puisque cette syntaxe correpond à une **interface fonctionnelle existante** ,Java 8 n'a pas besoin qu'on lui precise le type des arguments : c'est ce qu'on appelle l'**inférence de type**.  
  
La syntaxe devient:

     (arg1, arg2) -> { body }

##Valeur de retour implicite
Dans les lambdas vu ci-dessus, `{ body }` peut retourner une valeur. 
   
Par exemple, on aurait en Java 7 :

    new SomeInterface() {
       
       @Override
       public SomeType someMethod(String arg1, String arg2) {
          return (someValue);
       }
    }
    
Avec les lambdas, on est **pas obligé de préciser le « return »** et on peut ecrire :

    (arg1, arg2) -> someValue


##Suppression des paranthèses
Si la methode de l'interface fonctionnelle ecrite avec une lambda ne comporte qu'**un argument**, on peut **omettre les paranthèses** :
    
     (arg) -> someValue
    
devient:

    arg -> someValue
    
 
#Accés aux variables locales
Une lambda peut acceder aux variables locales qui sont :
  - **final**
  - **"effectively final"** : c.a.d qui ne sont pas écrite avec 'final' devant mais qui ne sont pas modifiées dans les faîts :

     final String s = ...;
     doSomething(someArg -> use(s));
      
 mais aussi
      
     String s = ...;
     doSomething(someArg -> use(s));

>ATTENTION: dans ce cas, "s" ne doit **jamais être modifiée**.
{: .error}

>Le pourquoi du "final" dans les inner classes sur [stackoverflow](http://stackoverflow.com/questions/3910324/why-inner-classes-require-final-outer-instance-variables-java).  
En gros, Java ne passe pas la reférence à la variable mais une copie. Si on change la valeur de la variable, l'originale et la copie n'ont plus les mêmes valeurs.

#@FunctionalInterface
**@FunctionalInterface** est un **marqueur** qui indique qu'on utilise cette interface avec des lambdas.  
On s'assure ainsi que les autres developpeurs ne **modifirons pas cette interface** (en ajoutant une autre méthode par exemple) d'une maniere succeptible de **"casser"** l'utilisation de cette interface avec les lambdas.

#Lambdas avec des classes et des instances
 Il est possible d'invoquer une méthode avec les lambdas en utilisant le séparateur "**::**"
 
 Si la méthode est **static**:
 
     ClassName::staticMethodeName
     
 sinon, il faut une instance:
 
     instanceName::methodeName
     

#java.util.function Package
Ce package fournit un ensemble d'interfaces fonctionnelles prètes à l'emploi (que je n'aurait pas à définir moi-même).  
Ces interfaces n'ont pas d'implémentations particulières, mais elles décrivent un nombre important d'opérations classiques:
  
  - tester 1 argument, 2 arguments, ....
  - transformer
  - créer, initialiser
  - ...
  
On peut dire que ces interfaces représentent **5 grandes "familles"** d'opérations courrantes :
  
  - Predicate
  - Function & BiFunction
  - Consumer
  - Supplier
  - BinaryOpérator

voir l'ensemble de ces interfaces à tout faire dans l'**[API](http://docs.oracle.com/javase/8/docs/api/java/util/function/package-summary.html)** Java 8.  


>L'idée de ces interfaces est de données à Java 8 l'allure de la programmation fonctionnelle (avec un type "Function" qu'on peut passer en argument à d'autre fonction ([first-class function](http://en.wikipedia.org/wiki/First-class_function))), alors qu'en réalité on travail avec des interfaces typées ayant une unique méthode.
{: .warnning}  

##Predicate
L'ojectif des Predicates est de tester quelquechose.  
La méthode **test(...)** définie dans l'interface ressemblera à :

    boolean test(T t);
    
 
##Function & BiFunction

###Function
Une fonction prend **un type en argument** et renvoie en **valeur de retour  un autre type**.  
La méthode **apply(...)** définie dans l'interface ressemblera à :
 
    R apply(T t);
    

###BiFunction
Rien compris !!!