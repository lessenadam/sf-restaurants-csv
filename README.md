# sf-restaurants-csv

## Overview

A script to parse a great article by Eater SF and output a CSV with a row per bar/restaurant. 

Each entry will have: 
```
{
  neighborhood: string, 
  category: enum, // the categories are standardized from the Eater SF article
  name: string, // name of restaurant
  link: UrlString,
  description: string, 
  address: string
}
```

source: https://sf.eater.com/2016/7/28/11706330/best-date-spots-restaurants-bars-cafes-san-francisco

## Getting started

To generate your own restaurant CSV, first clone the repo.

Then, run:

```
$ npm install
```

Then, run:

```
$ node index.js
```

## Making changes

All logic lives in `index.js`. Feel free to change as your heart desires.
