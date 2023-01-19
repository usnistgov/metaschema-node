# Usage of Mixins

Date: 2022-05-27

## Status

Accepted

## Context

The `metaschema-java` `metaschema-model-common` package makes heavy use of multiple-inheritance.
For example, the `IAssemblyDefinition` interface inherits the `IModelContainer`, `INamedDefinition`, and `AbstractAssembly` interfaces.
Typescript was not built to support multiple inheritance in abstract classes.
_Note abstract classes are used here in lieu of interfaces (which do support multiple inheritance) because Typescript interfaces cannot have default implementations._
There are two solutions that preserve the structure of classes:

-   Chain the inheritance with utility (unused) classes
-   Utilize the mixin pattern

## Decision

We have decided to make use of mixins.

## Consequences

Using the example of the `AbstractAssemblyDefinition`: instead of inheriting the `AbstractModelContainer`, `AbstractNamedDefinition`, and `AbstractAssembly` classes, mixin functions would be created to wrap a given base class (in this case `AbstractAssembly`) with an anonymous abstract class inheriting the `INamedDefinition` interface, and another inheriting the `IModelContainer` interface.

One consequence of this action, is that extending mixin classes directly is tricky, and requires wrapping an empty subclass in a mixin.
Thankfully there are no instances of this in the codebase as of now.
