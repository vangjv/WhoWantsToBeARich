# API Contracts: Who Wants to Be a Millionaire Game Application

**Date**: 2025-12-14  
**Feature**: 001-millionaire-game-app

## Overview

This directory contains contract definitions for the application. Since this is a fully client-side application with no backend API, the "contracts" consist of:

1. **TypeScript Interfaces** - Type definitions for all data models (see data-model.md)
2. **JSON Schema** - Schema for question pack import/validation
3. **BroadcastChannel Event Protocol** - Message format for host-seat synchronization

No REST API or GraphQL endpoints are defined since all functionality is client-side.

---

## Contents

- [question-pack.schema.json](question-pack.schema.json) - JSON Schema for question pack import validation
- [sync-event.protocol.md](sync-event.protocol.md) - BroadcastChannel event message protocol specification
- [typescript-interfaces.md](typescript-interfaces.md) - Complete TypeScript interface definitions for reference

---

## Contract Versioning

**Current Version**: 1.0.0

Changes to contracts should be versioned using semantic versioning:
- **MAJOR**: Breaking changes to question pack schema or sync event protocol
- **MINOR**: Additive changes (new optional fields, new event types)
- **PATCH**: Documentation clarifications, non-functional changes

---

## Validation

### Question Pack Validation

Question packs imported by users must conform to [question-pack.schema.json](question-pack.schema.json). The application performs validation using Zod (TypeScript-first validation) which mirrors the JSON Schema structure.

**Validation occurs**:
- On import via file upload
- Before game start (verify selected pack is still valid)

**Validation failures**:
- Show user-friendly error messages listing specific issues
- Prevent game start until valid pack is loaded

### Sync Event Validation

Sync events are validated using TypeScript discriminated unions at compile time. Runtime validation is minimal since host and seat run the same codebase and communicate within same browser profile.

---

## Testing

Per constitution, no automated tests are required. Validation of contracts occurs through:
- TypeScript compiler type checking
- Manual testing with valid and invalid question packs
- Manual testing of sync events across host and seat displays
