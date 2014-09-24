---
layout: post
title: "Git   configuration"
description: ""
category: 
tags: [git, configuration, git-configuration]
---
{% include JB/setup %}

#Objectifs 
Décrire comment la configuration de Git est organisée et quelles sont les information minimales à renseignées.

---

#Configuration de Git

##3 niveaux de configuration
<br>

| **system**  | Ces valeurs sont **communes à tous les utilisateurs** de l'ordinateur. |
| **global**  | Ces valeurs sont dans le 'home' de l'utilisateur. Elles sont **propres à un utilisateur particulier**. |
| **local**   | Ces valeurs sont **propre à un 'projet' particulier**.     |


Les propriétés d'un niveau surchargent celles d'un autre plus général.   
__l'ordre de prise en compte est :__   

1. local
2. global
3. system 

##Sauvegarde de la configuration
Git sauvegarde les valeurs de configuration dans **des fichiers**.

###Système
Syntaxe: `git config --system <property_name> <property_value>`

Ces valeurs sont sauvegardées sous:

  * `/etc/gitconfig` (mac)
  * `todo` (windows)

###Globale
Syntaxe: `git config --global <property_name> <property_value>`

Ces valeurs sont sauvegardées sous:

  * `~/.gitconfig` (mac)
  * `todo` (windows)

###Locale
Syntaxe: `git config --local <property_name> <property_value>`

Ces valeurs sont sauvegardées sous:

  * `.git/config` (mac & windows)

>**ATTENTION aux TYPOs**  
Git ne vérifie pas que ces valeurs aient un sens.  
<br>
On peut sauvegarder "toto", **Git ne hurlera pas**, il ne dira rien.  
En cas de **typo(s)**, Git **ignorera silencieusement** la propriété et **rien ne se passera !!**
{: .attention}

#Section et sous-sections
Les valeurs sont stockées sous forme de **clé-valeur**.   

Il est possible d'organiser les propriétés en **sous-sections** en les **imbriquant avec le séparateur "."**: 
!["git subsection syntax"](/assets/images/git/git_config_subsection_syntax.png)  
ce qui donne dans le fichier :  
!["git config subsection result"](/assets/images/git/git_config_subsection_result.png)  
où **"something"** est la sous-section de **[fake]**

#Ma configuration
 
**informations sur l'auteur**

	git config --global user.name "Jerome Dantan"
	git config --global user.mail jerome.dantan.pro@gmail.com
{: .rubric-3}
	

**colorisation des commentaires et informations fournis par Git**

    git config --global color.ui true
{: .rubric-3}
    

**pas de fichiers ".orig" générés lors des merges**

	git config --global mergetool.keepBackup false  
{: .rubric-3}


**conversion des caractères de fin de lignes entre windows et unix (mac OS)**
 
	git config --core.autocrlf input   # unix & macOS
	
	git config --core.autocrlf true   # windows
{: .rubric-3}  




**kdiff3 comme outil de merge**

    git config --global merge.tool kdiff3
    
et si kdiff3 n'est pas dans le PATH, ajouter :

    $ git config --global mergetool.kdiff3.path /Applications/kdiff3.app/Contents/MacOS/kdiff3

_Voir stackoverflow **[9776434](http://stackoverflow.com/questions/9776434/git-mergetool-config-on-mac-osx)**_
{: .rubric-3}

>Certaines de ces customisations peuvent être faites via le fichier **.gitattributes**
{: .information}

#Mes fichiers de configuration 

  * [gitconfig.txt](/assets/files/git/gitconfig.txt) (à renommer en '.gitconfig').