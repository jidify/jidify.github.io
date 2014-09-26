---
layout: post
title: "java 8 streams"
description: ""
category: 
tags: [java 8, stream]
---
{% include JB/setup %}

#Stream : à quoi ça sert
Les streams sont des wrappers autour de data source (comme les tableaux, les listes, ...).  
Ils implementent des opérations nouvelles (utilisant les lambdas).  
Ces nouvelles opérations peuvent s'exécuter sequentiellement ou en parallelle. 

>Les streams **ne sont pas** des structures de données!  
Les streams **créer un pipeline d'opérations** autour d'une structure de données. 
{: .warning}


#Créer un stream

3 manières classiques :

  - `someList.stream()`
  - `Stream.of(arrayOfObjects)`
  - `Stream.of(val1, val2, …)`

>En employant les **primitives* (int) au lieu des **objets wrappers** (Integer), il est possible de commettre des erreurs! 
{: .attention}


#Créer une structure de données depuis un stream

##Array

    myStream.toArray(Type[]::new)
    
    ex:
    employeeStream.toArray(Employee::new)
    
    
##Collection

####List

    myStream.collect(Collectors.toList());
    
ou, plus généralement, en utilisant l'import static :   
    
    import java.util.stream.Collectors.*;

    ...
    
    myStream.collect(toList());
    
    
###Set

    import java.util.stream.Collectors.*;

    ...
    
    myStream.collect(toSet());
    
    
#Différentes nature des méthodes d'un stream

##Méthodes intermédiaires

TODO

##Méthodes finales 

TODO

##Méthodes "court-circuit"    

TODO

    
#Méthodes usuelles des streams

##forEach

**"forEach" permet d'exécuter une lambda sur chaque élément d'un stream.**  
Cette lambda est un "**Consumer**".

sequenciel:
    
    employees.forEach(e -> e.setSalary(e.getSalary() * 11/10))
    
    
parallèle:
 
      employees.parallel().forEach(e -> e.setSalary(e.getSalary() * 11/10))
      
>forEach est une **opération terminale**. C'est à dire que forEach **consome les éléments du stream**, qui ne sont plus disponibles ensuite.
<br>    
On ne peut pas ecrire:  
<br> 
someStream.forEach(element -> doOneThing(element));  
someStream.forEach(element -> doAnotherThing(element));
<br>        
car dans la 2eme ligne, someStream "n'existe plus" !!
{: .warning}        

##map

**"map" permet de transformer (changement de type) chaque élément d'un stream en leur appliquant une lambda.**  
Cette lambda est une "**Function**".

    ids.map(EmployeeUtils::findEmployeeById)

Le stream d'entrée contient des "Integer".  
Le stream de sortie contient des "Employee".

##filter

**"filter"permet de créer un nouveau stream ne contenant que les élément ayant passer le test désiré, exprimé sous forme de lambda.**   
Cette lambda est un "**Predicate**".

    employees.filter(e -> e.getSalary() > 500000)


##findFirst

**"findFirst" permet de retourner le premier élément d'un stream, en court-circuitant d'autres opérations appliquées sur le stream.**  
"findFirst" ne prend pas de paramètre et retourne un **[Optional](http://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)**, car il n'y a pas forcément d'élément correspondant au critère de recherche.  
  
Typiquement, on utilisera un **findFirst pour stopper un "filter" dés qu'un élément sera trouvé**: 

    someStream.filter(…).findFirst().orElse(otherValue)

    //avec un "map" devant
    stream.map(someOp).filter(someTest).findFirst().get()
    
>**orElse()** est une méthode d'[Optional](http://docs.oracle.com/javase/8/docs/api/java/util/Optional.html). 
<br>  
En voici les méthodes principales:  
   - value.get () - retourne la valeur si présente, sinon lance une exception.  
  - value.orElse(other) - retourne la valeur si présente, sinon retourne 'other'.   
  - value.ifPresent(Consumer) - excécute la lambda si la valeur est présente.  
  - value.isPresent() - renvoie vrai si la valeur est présenté
{: .information}
  


##findAny


