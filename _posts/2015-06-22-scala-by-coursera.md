---
layout: post
title: "scala by coursera"
description: ""
category: 
tags: [scala]
---
{% include JB/setup %}

## Polymorphisme
2 types de polymorphisme :

  * Subtype
  * Generic

Lorqu’on mixe les 2, expression du genre `MyClass[A] {...}` ou `TODO methode parametrée`, cela introduit de nouveaux comportements à definir:

  * bounds parameter type
  * variance

## The Liskov Substitution Principle

Voici une définition assez simple du *Liskov Substitution Principle* donné par M.Odersky dans la formation Coursera: 

**The following principle tells us when a type can be a subtype of another:** 
 >If **A <: B**, then everything one **can to do with a value of type B** one should also be able to **do with a value of type A.**  
{: .information}


## Variance

### Covariance

#### Définition

         _________                     ___________
        |         |                   |           |
        |   Base  |                   |  f(Base)  |
        |         |                   |           |
        |___ ^____|                   |_____^_____|
            /_\        covariance          /_\
             |            ==>               |
             |                              |
        ___________                    _____________ 
       |           |                  |             |
       |  Derived  |                  |  f(Derived) |
       |           |                  |             |
       |___________|                  |_____________|



#### Notation Scala

    [+T]


### Contravariance

#### Définition

         _________                       ___________
        |         |                     |           |
        |   Base  |                     |  f(Base)  |
        |         |                     |           |
        |___ ^____|                     |___________|
            /_\        contravariance         |
             |              ==>               |
             |                                |
        ___________                     _____\_/_____ 
       |           |                   |      v      |
       |           |                   |             |
       |  Derived  |                   |  f(Derived) |
       |           |                   |             |
       |___________|                   |_____________|


#### Notation Scala

    [-T]

## Régles d’acceptance de variance

Tiré du cours d’Odersky sur coursera, voici les regles d’acceptance : 

  * **Covariant** type parameter can only appear in **method results**.
  * **Contravariant** type parameter can only appear in **method parameters**.
  * **Invariant** type parameter can appear **anywhere**




## Subtype des ...

### Fonction

Une fonction est subtype d’une autre fonction si elle respecte le principe de substitution de Liskov, soit:

si `A2 <: A1` et  `B1 <: B2` alors `A1 => B1 <: A2 => B2`

