# Claude Development Guide for Chess404

## Project Overview
Chess404 is a modern chess platform built with Next.js, TypeScript, and Tailwind CSS. This guide helps Claude understand the project structure, development standards, and available tools.

## Project Goals
- Create a beautiful, performant chess game with Player vs AI gameplay
- Use Tokyo Night theme for a modern, aesthetic dark mode experience
- Build a solid foundation that can be extended with multiplayer, puzzles, and more
- Maintain clean, testable, and well-documented code

## Development Environment

### Available MCP Servers
- **Playwright**: For browser automation, testing, and taking screenshots
  - Use for E2E testing
  - Visual regression testing
  - Debugging UI issues with screenshots

### Hooks Configuration
The `.claude/hooks.json` file defines automated actions:
- Pre-commit: Run linting and type checking
- Pre-push: Run tests
- Post-install: Generate types

## Code Standards

### TypeScript
- Always use strict mode
- Define interfaces for all component props
- Use enums for finite sets (piece types, colors)
- Avoid `any` type - use `unknown` if type is truly unknown

### React Best Practices
- Functional components only
- Use hooks for state management
- Memoize expensive computations
- Keep components small and focused

### File Organization
```
/components - React components (one component per file)
/lib - Business logic, utilities, types
/app - Next.js 13+ app directory
/public - Static assets
/tests - Test files mirroring source structure
```

### Naming Conventions
- Components: PascalCase (e.g., `ChessBoard.tsx`)
- Utilities: camelCase (e.g., `validateMove.ts`)
- Types/Interfaces: PascalCase with 'I' prefix for interfaces
- CSS classes: kebab-case
- Constants: UPPER_SNAKE_CASE

## Chess-Specific Guidelines

### Board Representation
- Use algebraic notation (a1-h8)
- Store board state as object with square keys
- Pieces represented by type and color

### Move Validation
- Always validate moves on both client and server
- Check for check/checkmate after each move
- Handle special moves explicitly (castling, en passant)

### AI Implementation
- Start simple with minimax algorithm
- Use position evaluation based on material and position
- Implement iterative deepening for time control

## Testing Strategy

### Unit Tests
- Test each chess rule independently
- Test AI move generation
- Test state management

### Integration Tests
- Test complete game flows
- Test special move scenarios
- Test game ending conditions

### E2E Tests (Playwright)
- Test user interactions
- Test responsive design
- Visual regression tests

## Development Workflow

1. **Planning**: Update todo list before starting
2. **Implementation**: Follow TDD when possible
3. **Testing**: Write tests for new features
4. **Documentation**: Update relevant docs
5. **Screenshots**: Use Playwright to capture UI state

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Lint code
npm run type-check   # Check TypeScript

# Testing with Playwright
npm run test:e2e     # Run E2E tests
npm run test:visual  # Visual regression tests
```

## Performance Considerations

1. **Chess Engine**
   - Move generation should be < 10ms
   - Use bitboards for future optimization
   - Cache position evaluations

2. **UI Performance**
   - Debounce user input
   - Use CSS transforms for animations
   - Lazy load non-critical features

3. **AI Performance**
   - Limit search depth based on time
   - Use alpha-beta pruning
   - Consider web workers for AI

## Debugging Tips

1. **Chess Logic Issues**
   - Log board state in FEN format
   - Visualize move generation
   - Test edge cases in isolation

2. **UI Issues**
   - Use Playwright screenshots
   - Check React DevTools
   - Monitor performance profiler

3. **AI Issues**
   - Log evaluation scores
   - Trace minimax tree
   - Test specific positions

## Future Considerations

When extending the project, consider:
- Database design for user accounts
- WebSocket architecture for multiplayer
- Caching strategy for analysis
- Mobile app considerations
- Internationalization

## Resources

- [Chess Programming Wiki](https://www.chessprogramming.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)