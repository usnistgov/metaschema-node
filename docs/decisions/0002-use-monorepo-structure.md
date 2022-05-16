# 2. Use a Monorepo Structure

Date: 2022-05-16

## Status

Accepted

## Context

The `metaschema-java` repository splits the metaschema into a number of packages that depend on one-another.
This approach has a number of advantages, including a smaller library size, seperation of concerns, dependency creep, etc., however seperating the components into multiple packages adds complexity to versioning and configuration.

## Decision

We have decided to follow the design of `metaschema-java`. We will use [Lerna](https://lerna.js.org/) to manage the packages defined under this repository.

## Consequences

- All packages under this repository will share the same version number, meaning that all packages will be in lock-step with one-another.
  - This means packages that depend on data generated from external sources, such as the OSCAL library, will have to be defined in a seperate repository (as is the case with `metaschema-java` and `liboscal-java`)
  - When a small change is made to one of the "leaf" packages, all of the other packages still have to change version numbers.
- The packages can inherit configuration from a base, such as common linter settings or Typescript compiler options.
