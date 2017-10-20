---
layout: post
title: "Git   Tips & Tricks"
description: ""
category: 
tags: []
---
{% include JB/setup %}

### Eviter les bubble merge

    git rebase work      // from branch 'temp'
    git checkout work    // switch to work
    git rebase temp      // => fast-forward
    

### Travailler à partir d'un SHA-1

#### Créer une branche

    git branch branchname <sha1-of-commit>
    
    ex:
    git branch my_new_branch 9c2d37d
    
_Voir fiche [2816715](http://stackoverflow.com/questions/2816715/branch-from-a-previous-commit-using-git) sur stackoverflow._


### Merger

Aprés que git ait signaler qu'il fallait effectuer un merge manuel

    git mergetool
    
