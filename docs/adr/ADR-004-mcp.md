# ADR-004 — MCP for Enterprise Tool Integration

**Status:** Accepted  
**Date:** baseline v0.1.0 — exact date not recorded (see audit 2026-10-19)

## Context
The platform must integrate with many enterprise systems without implementing bespoke agent APIs for every tool.

## Decision
MCP is the preferred tool integration protocol. A controlled MCP Gateway remains the enforcement boundary.

## Consequences
Integration becomes standardized, while gateway governance and MCP server lifecycle management become critical.
