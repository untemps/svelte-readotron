const { toBeInTheDocument, toHaveAttribute, toHaveStyle } = require('@testing-library/jest-dom/matchers')

expect.extend({ toBeInTheDocument, toHaveAttribute, toHaveStyle })
