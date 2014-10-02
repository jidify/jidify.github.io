---
layout: post
title: "Environement de Dev Java & JavaScript"
description: ""
category: 
tags: [java, javascript, environement developpement]
---
{% include JB/setup %}

#JavaScript

##Pré-requis  
Si elles ne sont pas déjà présentent, installer **en globale** les applications suivantes:  

  - node.js   : utiliser l'installeur du [site de Node.js](http://nodejs.org/)

  - grunt-cli : `npm install -g grunt-cli`

  - bower : `npm install -g bower`

##Grunt

>Toutes les installations suivantes sont **locales**.
{: .information}

###Grunt 'itself'

    npm install grunt --save-dev


###concatenation & copy

    npm install grunt-contrib-concat --save-dev
    npm install grunt-contrib-copy --save-dev


###clean
    
    npm install grunt-contrib-clean --save-dev

###Server & proxy

####server

    npm install grunt-contrib-connect --save-dev

>ATTENTION: si on met en place "watch" ent utilisant "connect", il faut mettre "**keepalive : false**" dans la task "connect"!!  
_[https://github.com/gruntjs/grunt-contrib-watch/issues/111](https://github.com/gruntjs/grunt-contrib-watch/issues/111)_
{: .attention}

###proxy
le proxy permet de résoudre les problèmes de _**Same-origin policy**_.

    npm install grunt-connect-proxy --save-dev

>ATTENTION : c'est le bordel !!!  
  => si je redirige tout sur le serveur java `context: '/'` , alors je ne charge plus index.html qui est dans le projet JavaScript.    
  => si je ne met que `context: '/api/'` , je ne vais plus sur le serveur java pour les 404 par exemple.  
<br>
Du coup, mise en place d'un filtre **CORS** coté serveur java.
{: .attention}


###TU

    npm install grunt-karma --save-dev
    npm install karma-jasmine@2_0 --save-dev  // jasmine 2
    karma init karma.conf.js


###watch

    npm install grunt-contrib-watch --save-dev

>**livereload ≠ watch !!**  
<br> 
_**livereload**_ permet que le navigateur soit synchronisé automatiquement avec le code.  
_**watch**_ observe si il y a des changements sur un ensembles de fichiers/répertoires et lance une (des) tache(s) grunt si c'es le cas.  
<br>
MAIS, maintenant, **livereload est embarqué dans 'grunt-contrib-watch'** !!
{: .warning}


###Exemple de fichier Gruntfile.js
  
[Gruntfile.js](/assets/files/env_dev/Gruntfile.js)

avec ce fichier, il faut lancer **karma + [task_name]**, par exemple : 

    grunt karma:unit:start dev
    
    
##Bower

###configuration

Définir l'emplacement des dépendances dans le fichier _.boxerrc_

    {
       "directory" : "vendor"
    }


###Dépendances    
    
Récupérer les dépendances suivantes :

  - angular
  - angular-resource
  - angular-route
  - angular-mocks (nécessaire aux TU)

soit:
    
    bower install angular --save
    bower install angular-resource --save
    bower install angular-route --save
    bower install angular-mocks --save      
    
     