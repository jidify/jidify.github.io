---
layout: post
title: "Tests unitaires en Java"
description: ""
category: 
tags: [assertJ, tests unitaires, java]
---
{% include JB/setup %}

#Test Unitaire: JUnit
##cycle de vie d'un test

###methode statiques => exécutées 1 fois par testsuite
- @BeforeClass
- @AfterClass


###méthode (d'instance) exécuter pour chaque methode annotée "@Test"
	 
- le **constructor** de la classe de test
	 
- méthode annotée avec `@Before`

- méthode annotée avec `@After`
	 

## Test runner: @RunWith
l'annotation `@RunWith` (class level) permet de changer le "test runner". Cela permet de modifier le cycle de vie de d'une suite de test JUnit.
     
###Exemples
- le test runner de Spring ("SpringJUnit4ClassRunner") supporte des annotations spécifiques et inclus le chargement d'un contexte Spring dans le cycle de vie de la suite de tests.


- le test runner de mockito ("MockitoJUnitRunner") supporte des annotations spécifiques (@Mock, @InjectMock) pour prendre en compte la création des mocks avant l'exécution des tests [https://tedvinke.wordpress.com/2014/02/13/mockito-why-you-should-not-use-injectmocks-annotation-to-autowire-fields/ | pour info].
   
- le test runner parametrisé ("Parameterized") qui permet de fournir plusieurs jeux de données à une suite de tests.
  

##Parametre de l'annotation @Test
- `expected` : pour tester les exceptions  
ATTENTION: tout le test est entre (try ... catch)  
=> préférer l'annotation `@Rule` qui permet de test le message de l'exeption par exemple

- `timout` : en milliseconde : permet de définir un temps max d'execution => à utiliser généralement dans les tests d'intégration.
  

##Convention de nommage des méthodes de test

    "when_some_condition is met_then_this_happens"
   
 soit, par exemple:
      
    @Test
    public void when_income_less_than_5Lacs_then_deducts_10_percent_tax() {...}
       
Cela permet d'éviter les commentaires ".describedAs("bla bla bla ...")" dans le code des assertions.


#Assertions: AssertJ
    
##But d'une assertion
Une assertion doit explicité clairement pourquoi le test échoue (sans avoir à utiliser le debugger pour comprendre ce qui se passe !!)
    

#assertJ

##Pourquoi assertJ

[AssertJ](http://joel-costigliola.github.io/assertj) permet d'**écrire des assertions** dans les tests unitaires de manière **plus simple et plus intuitive** qu'avec JUnit seul.  
<br>
Il existe d'autres librairies comme Hamcrest ou FEST-Assert, mais aujourd'hui assertJ:

  - a la **communauté la plus active** du momment (2014)
  - permet de profiter de la complétion des IDE grace à une API basée sur des _[fluent interface](http://martinfowler.com/bliki/FluentInterface.html)_.



#Mock: Eliminer les dépendances avec les Mockito
 
##Mock vs Stub
 - **Mock = Smart Stub**
      - Un mock peut modifier la valeurs de retour en fonction des paramètres reçu
 	  - Un mock peut indiquer le nombre d'appels (ou pas d'appel) à une/des méthode(s)
 		                  
##Mockito
##creation de mock
 	          
    this.mockHighScoreService = mock(HighScoreService.class);    // methode 
    
    "mock(clazz)" ou annotation "@Mock" ou "@InjectMock"

##Définition du comportement du mock 
###when(...).thenReturn(...)    
    
    Mockito.when(mockHighScoreService.getTopFivePlayers())
                .thenReturn(firstHighScoreList)
                .thenReturn(secondHighScoreList);
 
##verification 
 - vérifier que la methode "getTopFivePlayers()" à étée appelée 2 fois.
 
     verify(mockHighScoreService, times(2)).getTopFivePlayers(); 

##les Spy
       MailService mailService = new MailService();   // l'instance
		mailService = Mockito.spy(mailService);        // le spy sur cette instance
		        
**ATTENTION:**  
le comportement des methodes des Spy est défini avec `doXXX(...).when(spy_instance).spiedMethod()`:

		          Mockito.doReturn(...).when(mySpy).theMedodSpied()           
		          Mockito.doNothing(...).when(mySpy).theMedodSpied()
		     
la vérification avec les Spy:
on utilise le pattern suivant `verify(spy_instance, verificationTODO()).spiedMethod()`:
 
    Mockito.verify(mySpy, Mockito.never()).theMedodSpied();     // 
		         
		      


#Outils
##_GenerateTestCase_ pour IntelliJ

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


