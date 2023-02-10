# N. Brief ADR Title

Date: 2023-01-27

## Status

Proposed

## Context

`metaschema-node` was initially modelled after `metaschema-java`, which specified a hard separation between the "model" package, and the "model-common" package.
This was done to separate the core logic of the metaschema and the class hierarchy from the XML loader implementation.

This separation is not necessary in the `metaschema-node` implementation and adds complexity.

Bundlers using pieces of `metaschema-model-common` can reduce the surface of the library through tree shaking, which is standard practice in the Javascript world.

The current layout creates problems in that tests relying on the `XMLMetaschema` implementation have to be placed in `metaschema-model` even if they are testing core functionality of `metaschema-model-common`.
Additionally any test infrastructure shared between the two packages has to be duplicated.

## Decision

The proposed decision is to merge `data-utils` and `metaschema-model-common` into `metaschema-model`.

## Consequences

`metaschema-model` will require a new structure to encompass all of the libraries.
