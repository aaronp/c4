Acme trading platform

This file is the source of truth for the C4 model below. Heading depth is nesting: ## people and systems, ### containers, #### components. Every element has a slug; relationships point at dot paths of slugs, and roll up to whatever boxes are visible.

# Model: Acme Trading

## Person: Trader
- slug: trader
- desc: Places and manages orders
- types commands → broker.cli.parser: enters orders [Terminal]
- uses → broker.portal: places orders [HTTPS]

## System: Broker
- slug: broker
- desc: Takes client orders and routes them to Trading

### Container: CLI
- slug: cli
- desc: Command-line client for traders
- tech: Go

#### Component: Command Parser
- slug: parser
- desc: Turns typed commands into order requests
- tech: Go
- uses → broker.cli.rest-client: sends order requests

#### Component: REST Client
- slug: rest-client
- desc: Signs and sends order requests
- tech: Go net/http
- calls → trading.orders.gateway: places orders [REST/HTTPS]

### Container: Web Portal
- slug: portal
- desc: Browser front end for traders
- tech: React
- calls → trading.orders.gateway: places orders [REST/HTTPS]

## System: Trading
- slug: trading
- desc: Accepts, matches and settles orders

### Container: Order Service
- slug: orders
- desc: Accepts and validates incoming orders
- tech: Java

#### Component: API Gateway
- slug: gateway
- desc: Single entry point for order traffic
- tech: Spring Cloud Gateway
- forwards → trading.orders.validator: order requests

#### Component: Order Validator
- slug: validator
- desc: Checks limits and order shape
- tech: Java
- reads → trading.positions: checks limits [SQL]
- submits → trading.engine: valid orders [gRPC]

### Container: Matching Engine
- slug: engine
- desc: Matches buy and sell orders
- tech: Rust
- publishes → trading.events: trade executed [Kafka]

### Container: Settlement
- slug: settlement
- desc: Settles executed trades
- tech: Go
- consumes → trading.events: trade executed [Kafka]
- uses → bank: settles funds [SWIFT]

### Database: Positions
- slug: positions
- desc: Positions and risk limits
- tech: PostgreSQL

### Queue: Trade Events
- slug: events
- desc: Executed trades
- tech: Kafka

## External: Clearing Bank
- slug: bank
- desc: Holds client funds and settles trades

# Layout

- trader: 96, 96
- broker: 96, 352
- broker.cli: 0, 0
- broker.cli.parser: 0, 0
- broker.cli.rest-client: 320, 0
- broker.portal: 320, 0
- trading: 416, 352
- trading.orders: 0, 0
- trading.orders.gateway: 0, 0
- trading.orders.validator: 320, 0
- trading.engine: 320, 0
- trading.settlement: 640, 0
- trading.positions: 0, 232
- trading.events: 320, 232
- bank: 736, 352
