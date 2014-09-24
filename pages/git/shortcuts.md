---
layout: page
title: "Shortcuts"
description: "Mes alias pour Git."
tagline: ""
tags: [git, shortcut, shortcuts]
---
{% include JB/setup %}

##Création des alias

###Affichage des logs
    //affichage des logs sur une ligne
    git config --global alias.l "log --pretty=oneline"

    //visualiser les branches et les commit sans gitk
    git config --global alias.l "log --graph --full-history --all --pretty=format:"%h%x09%d%x20%s"
    
###Commit
    git config --global alias.ac "commit -a -m 'SAVEPOINT'"
    
###Push    
    git config --global alias.psa "push --all"


##Fichier de configuration globale