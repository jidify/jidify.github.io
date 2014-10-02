---
layout: post
title: "Tests unitaires en Java"
description: ""
category: 
tags: [assertJ, tests unitaires, java]
---
{% include JB/setup %}

#_GenerateTestCase_ pour IntelliJ

_GenerateTestCase_ est un plugin qui permet de générer des tests unitaires à partir de l'annotation _**@should**_ ajoutée dans la javadoc.

**ATTENTION:**  
Il faut upgrader la version de la JVM qui fait tourner Intellij (1.6 par defaut dans la versions 13.1), sinon on a l'exception _ java.lang.UnsupportedClassVersionError_:  

	Plugin 'GenerateTestCases' failed to initialize and will be disabled.  Please restart IntelliJ IDEA.
	....
	Caused by: java.lang.UnsupportedClassVersionError: com/intellij/generatetestcases/model/GenerateTestCasesSettings : Unsupported major.minor version 51.0
	    at java.lang.ClassLoader.defineClass1(Native Method)
	    ...


[Mac OS] **Editer le fichier** `/Applications/<Product>.app/Contents/Info.plist` et changer **JVMVersion de 1.6* à 1.8*:**  

    <key>JVMVersion</key>
    <string>1.8*</string> 

voir _[Selecting-the-JDK-version-the-IDE-will-run-under](https://intellij-support.jetbrains.com/entries/23455956-Selecting-the-JDK-version-the-IDE-will-run-under)_ sur le site de JetBrains

#assertJ

## Pourquoi assertJ

[AssertJ](http://joel-costigliola.github.io/assertj) permet d'**écrire des assertions** dans les tests unitaires de manière **plus simple et plus intuitive** qu'avec JUnit seul.  
<br>
Il existe d'autres librairies comme Hamcrest ou FEST-Assert, mais aujourd'hui assertJ:

  - a la **communauté la plus active** du momment (2014)
  - permet de profiter de la complétion des IDE grace à une API basée sur des _[fluent interface](http://martinfowler.com/bliki/FluentInterface.html)_.
