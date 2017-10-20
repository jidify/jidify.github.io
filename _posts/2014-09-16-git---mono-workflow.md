---
layout: post
title: "Git   Mono workflow"
description: ""
category: 
tags: [git, workflow, git-workflow]
---
{% include JB/setup %}

# Objectif
Décrire un workflow **simplissime** à utiliser lorsqu'on développe **en solo** sur un petit projet perso.

# Workflow

### Au début du developpement

1\. **Récupérer les commits** éventuels qui ne sont pas sur l'ordi sur lequel je m'apprette  à développer

    git pull --rebase // synchro avec remote repo
{: .rubric-4} 


2\. **Créer une branche** de développement temporaire - qui permet de rollbacker, de switcher de branche, etc. **facilement**

    git checkout -b temp
{: .rubric-4} 


3\. **Developper / Committer** 
{: .rubric-4}
 

4\. A la fin du développement, **mettre au propre les commits** si nécessaire.  
Cette action comportera généralement la fusion de plusieurs commits = **squash**

    git rebase -i HEAD~x

puis, modifier en ajoutant "stash" (ou "s") pour les lignes contenant les commit à concatener :

    pick <sha1> START bla bla
    s <sha1> blabla
    s <sha1> blabla
    ...
    s <sha1> blabla  => jusqu'au dernier commit
        
enfin, sauvegarder les modifications effectuées :        
  
    :wq
    ecrire commentaire
    :wq
{: .rubric-4} 


5\. **Récupérer** le travail effectuer dans la branche temporaire

    git checkout master    // aller sur la branche cible
    git merge temp        // merger avec la branche temporaire

>Normalement, le merge doit correspondre à un **fast-forward** si on a travaillé qu'avec une (ou des) branche temporaire.  
Faire un "rebase" devrait produire le même résultat.
{: .rubric-4 .information}


6\. Faire un **grand nettoyage**
Faire un grand nettoyage permet de s'assurer qu'il ne **traine pas un bout de code non commiter** dans la branche de développement temporaire.

    git branch -d temp          => supprime branche locale
    git push origin :temp       => supprime la branche remote temporaire
    git remote prune origin     => supprime de notre repository local toutes les branches remote qui n'existent plus
{: .rubric-4} 

7\. **Sauvegarder sur le repo distant**

    git push --all
{: .rubric-4} 


# Références
  
  * **[GitHub Flow Like a Pro with these 13 Git Aliases](http://haacked.com/archive/2014/07/28/github-flow-aliases/)**