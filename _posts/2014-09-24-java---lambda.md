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
    
#Inference de type

Dans l'exemple ci-dessus :

    (String arg1, String arg2) -> { body }
    
On précise le type des arguments, or puisque cette syntaxe correpond à une **interface fonctionnelle existante** ,Java 8 n'a pas besoin qu'on lui precise le type des arguments : c'est ce qu'on appelle l'**inférence de type**.  
  
La syntaxe devient:

     (arg1, arg2) -> { body }

#Valeur de retour implicite
Dans les lambdas vu ci-dessus, `{ body }` peut retourner une valeur. 
   
Par exemple, on aurait en Java 7 :

    new SomeInterface() {
       
       @Override
       public SomeType someMethod(String arg1, String arg2) {
          return (someValue);
       }
    }
    
Avec les lambdas, on est pas obligé de préciser le « return » et on peut ecrire :

    (arg1, arg2) -> someValue
