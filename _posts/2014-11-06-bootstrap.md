---
layout: post
title: "bootstrap"
description: ""
category: 
tags: [bootstrap]
---
{% include JB/setup %}

#Avoir la base

## fichier HTML5 minimum

	<!DOCTYPE html>
	<html>
	<head lang="en">
	    <title></title>
	</head>
	<body>

	</body>
	</html>

Mais **il manque des informations pour fonctionner correctement** (IE, responsive, ...)

## fichier HTML5 minimum viable 

	<!DOCTYPE html>
	<html>
	<head lang="en">
	    <meta charset="UTF-8">
	    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	    <meta name="viewport" content="width=device-width, initial-scale=1">

	    <title>TODO : add title</title>
	    <link rel="stylesheet" type="text/css" href="css/bootstrap.css">

	    <!--[if lt IE 9]>
	    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
	    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
	    <![endif]-->

	</head>
	<body>
	    <h1>Hello World!</h1>

	    <!-- scripts -->
	    <script src="js/jquery.js"/>
	    <script src="js/angular.js"/>
	</body>
	</html>

### Explications

#### Mode de fonctionnement de IE
`<meta http-equiv="X-UA-Compatible" content="IE=edge">`  
interdit le mode _**compatibilité**_ de IE et le force à **utiliser le dernier moteur de rendu disponible**.  
Cela garanti d'avoir le support des balises HTML et des propriétés CSS le plus à jour possible.


#### viewport

`<meta name="viewport" content="width=device-width, initial-scale=1">`

##### width
 Comme la résolution de l'ecran d'un mobile est plus petite que la taille des pages à afficher, la balise _**viewport**_ permet de définir 'virtuellement' le nombre de pixel qu'est sensé représenter l'écran. 
 
`<meta name="viewport" content="320px">` : l'ecran affichera 320px. Si la page fais 960px, on ne verra que 33% de la page. Il faudra scroller sur les cotés pour voir le reste du contenu.  
     
`<meta name="viewport" content="640px">` : l'ecran affichera 640px. Si la page fais 960px, on verra 66% de la page. etc...  

`... content="width=device-width" ...` s'adaptera à la définition du mobile (et même plutot du navigateur du mobile).    

##### init-scale
Sur un mobile, grace au tactile, on peut zoomer/dé-zoomer en "piçant/ecartant" les doigts sur l'écran. On veut en règle générale que la page s'affiche sans zoom/dé-zoom. Pour cela on précise que la taille initiale doit être de 100% : `initial-scale=1`.

>On peut empécher le zoom au dela de certaines valeurs `maximum-scale=1`  
idem pour le dé-zoom : `minimum-scale=1`  
On peut interdire le zoom/dé-zoom  `User-scalable=no`  
<br>
voir fiche [stackoverflow](http://stackoverflow.com/questions/22777734/what-is-initial-scale-user-scalable-minimum-scale-maximum-scale-attribute-in)
{: .information}

#### compatibilité IE8

Ajouter les 2 scripts suivants pour permettre à IE8 _d'émuler du HTML5 & CSS3_ afin d'afficher correctement bootstrap :

    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    
    
#Boostrap layout

### 1 - container

	<div class="container">
	    <h1>Hello World!</h1>
	    
	</div>


Il faut ajouter un [container](http://getbootstrap.com/css/#overview-container) pour positionner correctement les éléments avec le _**grid system**_.

>Le container peut-être fixe (exemple ci-dessus) ou fluide `class="container-fluid"`
{: .information}

### 2 - row

	<div class="container">
	    <div class="row">
	    </div>
	</div>

On ajoute ensuite une ligne, qui va contenir les **12 colonnes du système de grille de bootstrap**.


### 3 - column-
La magie de bootstrap pour _faire du responsive_ vient principalement des différentes classes CSS `column-xx-xx` permettant de définir l'espace occupé par un élément en fonction de la taille résolution (en px) du _device_.  
<br>
On a les classes suivantes :

  - `col-xs` - **extra small displays** - pour les écrans  d'une largeur _**< 768px**_)
  - `col-sm` - **smaller displays** - pour les écrans  d'une largeur _**≥ 768px**_)
- `col-md` - **medium displays** - pour les écrans  d'une largeur _**≥ 992px**_)
- `col-lg` - **larger displays** - pour les écrans  d'une largeur _**≥ 1200px**_)

#### Un layout typique

  - 3 colonnes => desktop et tablette en mode landscape
  - 2 colonnes => tablette en mode portrait
  - 1 colonne  => mobile

![typical bootstrap layout](/assets/images/bootstrap/bootstrap_layout.png)

aurra les classes suivantes `col-xs-12` `col-sm-6` `col-md-4` pour définir les colonnes :

    <div class="col-xs-12 col-sm-6 col-md-4">
        <h4>[Content Column 1]</h4>
    </div> 
    <div class="col-xs-12 col-sm-6 col-md-4">
        <h4>[Content Column 2]</h4>
    </div>
    <div class="col-xs-12 col-sm-6 col-md-4">
        <h4>[Content Column 3]</h4>
    </div>
    ....
    
    
 - `col-xs-12` : cette `div` occupe à elle seule les 12 colonnes de la grille de boostrap => 1 `div` par ligne  (correspond au mobile).
 - `col-sm-6` : cette `div` occupe 6 des 12 colonnes de la grille de boostrap => 2 `div` par ligne  (correspond à la tablette mode portrait).
 - `col-md-4` : cette `div` occupe 4 des 12 colonnes de la grille de boostrap => 3 `div` par ligne  (correspond à la tablette mode landscape et au desktop).

