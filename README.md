# Decodes Documentation Platform

A source code parser, build process, and template server for the [decodes library](http://github.com/ksteinfe/decodes).

===

## Database Structure

Decodes relies on a firebase to record the information distilled from the source. Firebase is a NoSQL store which acts as an intermediate layer between the parse process and the build process. It is the responsibility of the ```decodes parse``` routine both to parse the source file structure and to produce the resultant database structure. It is the responsibility of the ```decodes build``` routine to update the decodes website based on the a database snapshot and a set of templates.

The database is organized into two primary buckets. A flat key, ```content```, contains all content on the site, examples, classes, and so on, by canonical name. The ```schema``` bucket defines where each item of content sites in the hierarchy. To generate the site:

1. Traverse the schema, attempting to unify templates with each key along the path.

2. Once you hit a leaf, look up that leaf in the ```content``` bucket. Look up a leaf template in the corresponding template bucket. If both are present, unify the templates and render out the html with the content. Note that nodes higher up in the tree have full access to all of their children.