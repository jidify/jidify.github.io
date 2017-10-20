---
layout: post
title: "JPA   Mapping des relation"
description: ""
category: 
tags: []
---
{% include JB/setup %}


# @OneToMany

## unidirectionnel

![JPA-oneToMany-unidirectional](/assets/images/jee/jpa/JPA-oneToMany-unidirectional.png)

	@Test
	public void createGameEntity_validOne() {

		Question q = new Question("Question", "Réponse");
		Game g1 = new Game("test_game");

		g1.addQuestion(q);

		gameDao.save(g1);
	}
	

### 1er mapping

	@Entity
	class Game {
	    ...
	   
		@OneToMany
		private Set<Question> questions = new HashSet<Question>();
	
	}

:boom: Booooommmm

StackTrace :

	org.springframework.dao.InvalidDataAccessApiUsageException: org.hibernate.TransientObjectException: object references an unsaved transient instance - save the transient instance before flushing: net.jidify.jpa.entities.Question; nested exception is java.lang.IllegalStateException: org.hibernate.TransientObjectException: object references an unsaved transient instance - save the transient instance before flushing: net.jidify.jpa.entities.Question
	
	
Hummm ... :mag_right:   
`org.hibernate.TransientObjectException` ... **save the transient instance** before flushing: net.jidify.jpa.entities.Question  

:bulb: Hey Hey .... **Cascade Persist**


### 2eme mapping : cascading

#### Génial, ça marche !!!
	
	...
	@OneToMany(cascade = CascadeType.ALL)
	private Set<Question> questions = new HashSet<Question>();

:smiley: Génial, ça marche !!!

### Regardons de plus prés

Voyons voir le détail dans les logs

	spring.jpa.properties.hibernate.show_sql=true
	logging.level.org.hibernate.type=TRACE
	
`logging.level.org.hibernate.type` permet de voir la valeur des paramètres des requètes.

Donc, dans ces logs ....

	insert into GAME (id, name) values (default, ?)
	insert into QUESTION (id, answer, text) values (default, ?, ?)
	insert into GAME_QUESTION (game_id, questions_id) values (?, ?)
	
:confused: **3** `insert` ... je pensais en avoir seulement 2 !!

3 tables, dont cette table de jointure `GAME_QUESTION` 

![JPA - oneToMany - default Join Table](/assets/images/jee/jpa/JPA-oneToMany-defaultJoinTable.png)

alors qu'il me semble qu'avec 2 tables, ça serait largement suffisant :

![JPA - oneToMany - default Join Table custom](/assets/images/jee/jpa/JPA-oneToMany-defaultJoinTable-custom.png)
	
:bulb: Mais je peux le faire avec un _**@JoinColumn**_ .... 

	
### 3eme mapping : joinColumn

#### Génial, ça marche !!!
    ...
	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "GAME_ID")
	private Set<Question> questions = new HashSet<Question>();
	

:smile: J'ai bien mes 2 tables !!

![JPA - oneToMany - Join Column](/assets/images/jee/jpa/JPA-oneToMany-JoinColumn.png)

###Regardons de plus prés

Dans ces logs ....

    insert into GAME (id, name) values (default, ?)
    insert into QUESTION (id, answer, text) values (default, ?, ?)
    update QUESTION set game_id=? where id=?

:open_mouth: Problème = 2 insert (trés bien) + **1 update**

OK .... je vois que l'`insert` dans QUESTION ne comprend pas le **game_id**.  
A priori, me dis-je, si je peux dire à Hibernate de rajouter le **game_id** au moment de l'`insert`, ça devrai être bon.

![JPA - oneToMany - Join Column custom logs](/assets/images/jee/jpa/JPA-oneToMany-joinColumn-customLogs.png)

:bulb: et si j'interdisais la possibilité de ne pas avoir de **game_id** ...

### 4eme mapping : nullable = false

	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "GAME_ID", nullable = false)
	private Set<Question> questions = new HashSet<Question>();

En rajoutant `nullable = false` à `@JoinColumn`, j'espère avoir le résultat escompté.

Verdict :

    insert into GAME (id, name) values (default, ?)
    insert into QUESTION (id, answer, text, game_id) values (default, ?, ?, ?)
    update QUESTION set game_id=? where id=?

 :frowning: j'ai bien le **game_id** dans l'`insert`, mais j'ai encore un `update` (en trop à mon avis)!!
 
 :cry: J'ai beau chercher partout, je ne trouve pas de solution satisfaisante. La seule solution consiste à ajouté `updatable = false`  à `@JoinColumn` : 
 
	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "GAME_ID", nullable = false, updatable = false)
	private Set<Question> questions = new HashSet<Question>();

Mais cela revient à dire que **l'association Game-Question est non-modifiable (immutable)** , ce qui n'est pas vraiment ce que j'avais en tête au début!!  

De plus, lors de mes recherches je tombe sur **cette mise en garde dans la documentation d'Hibernate** : 

>"A unidirectional one to many using a foreign key column in the owned entity is not that common and not really recommended."
{: .attention}

  - [Hibernate unidirectional one to many association - why is a join table better?](http://stackoverflow.com/questions/1307203/hibernate-unidirectional-one-to-many-association-why-is-a-join-table-better?lq=1)
  - [Documentation Hibernate (2.2.5.3.1.2. Unidirectional)](http://docs.jboss.org/hibernate/stable/annotations/reference/en/html_single/#entity-mapping-association-collections)

### OneToMany unidirectionnel : une mauvaise idée ?

Comme j'ai toujours entendu dire que les associations bi-directionnelles étaient rarement une bonne idée, je suis étonné qu'il n'y ai pas de solution (comme une petite annotation propriétatire d'Hibernate) qui me permette d'avoir ce gain en performance (**2**  `insert` - point barre)!

En fait, le mal est plus profond. Ce n'est pas uniquement d'un problème de performance qu'il s'agit. C'est plutôt un problème de cohérence des données.  
Prennons le cas suivant :

	Question q = new Question("Question", "Réponse");
	
	Game g1 = new Game("test_game_1");
	g1.addQuestion(q);
	gameDao.save(g1);
	
	Game g2 = new Game("test_game_2");
	g2.addQuestion(q);
	gameDao.save(g2);

Une fois exécuté, en base, il y a :  


![JPA OneToMany tables Values](/assets/images/jee/jpa/JPA-OneToMany-tablesValues.png)

Ca colle, j'ai bien 1 seul _Game_ associé à une _Question_ - même si, j'ai le sentiment d'avoir "écrasé" l'association _Game g1 - Question q_ qui est bien présente dans le code.

En effet, en mémoire, il y a :

![JPA OneToMany tables Values](/assets/images/jee/jpa/JPA-OneToMany-wrongMemoryRepresentation.png)

:angry: **J'ai l'inverse de ce que je voulais !!** Il y a 2 _Game_ pointant vers la même _Question_, soit une association _**@ManyToMany**_ au lieu d'une association _**@OneToMany**_.  
Mais en base il y a bien une _**@OneTo...**_ (Hibernate à veillé au grain en faisant 2 `update` correspondant aux 2 associations).  

>** MORALITE** :  
<br>
Le seul moyen de **garantir la cohésion** entre la **base de données** et la **représentation en mémoire** des associations _**@OneToMany**_ ... c'est d'avoir **une relation bi-directionnelle** (de type parent/child).   
<br>  
{: .information} 


	
	