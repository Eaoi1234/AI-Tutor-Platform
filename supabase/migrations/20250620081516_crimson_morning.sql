/*
  # Insert Sample Data for Learning Platform

  1. Sample Data
    - Default subjects (Mathematics, Physics, Chemistry, Biology, History, Literature)
    - Sample courses and modules
    - Sample lessons

  2. Notes
    - This provides initial data for testing and development
    - Real user data will be created through the application
*/

-- Insert default subjects
INSERT INTO subjects (id, name, code, description, icon, color, difficulty, total_topics) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'MATH', 'Algebra, Calculus, Geometry, and Statistics', 'Calculator', 'from-blue-500 to-blue-600', 'Intermediate', 24),
  ('550e8400-e29b-41d4-a716-446655440002', 'Physics', 'PHYS', 'Mechanics, Thermodynamics, Electromagnetism', 'Atom', 'from-purple-500 to-purple-600', 'Advanced', 20),
  ('550e8400-e29b-41d4-a716-446655440003', 'Chemistry', 'CHEM', 'Organic, Inorganic, and Physical Chemistry', 'FlaskConical', 'from-green-500 to-green-600', 'Intermediate', 18),
  ('550e8400-e29b-41d4-a716-446655440004', 'Biology', 'BIO', 'Cell Biology, Genetics, Ecology, and Evolution', 'Dna', 'from-emerald-500 to-emerald-600', 'Beginner', 22),
  ('550e8400-e29b-41d4-a716-446655440005', 'History', 'HIST', 'World History, Ancient Civilizations, Modern Era', 'Scroll', 'from-amber-500 to-amber-600', 'Beginner', 16),
  ('550e8400-e29b-41d4-a716-446655440006', 'Literature', 'LIT', 'Classic Literature, Poetry, Writing Techniques', 'BookOpen', 'from-rose-500 to-rose-600', 'Intermediate', 14)
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, title, description, subject_id, difficulty, estimated_hours, prerequisites, learning_objectives, is_public) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Calculus Fundamentals',
    'Master the fundamentals of differential and integral calculus',
    '550e8400-e29b-41d4-a716-446655440001',
    'intermediate',
    40,
    ARRAY['Basic Algebra', 'Trigonometry'],
    ARRAY['Understand limits and continuity', 'Master differentiation techniques', 'Apply integration methods', 'Solve real-world problems'],
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'Introduction to Quantum Physics',
    'Explore the fascinating world of quantum mechanics',
    '550e8400-e29b-41d4-a716-446655440002',
    'advanced',
    60,
    ARRAY['Classical Physics', 'Linear Algebra'],
    ARRAY['Understand wave-particle duality', 'Master Schrödinger equation', 'Analyze quantum systems', 'Apply quantum principles'],
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'Organic Chemistry Basics',
    'Learn the fundamentals of organic chemistry and molecular structures',
    '550e8400-e29b-41d4-a716-446655440003',
    'beginner',
    35,
    ARRAY['General Chemistry'],
    ARRAY['Understand molecular structures', 'Master reaction mechanisms', 'Identify functional groups', 'Predict chemical behavior'],
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample modules for Calculus course
INSERT INTO course_modules (id, course_id, title, description, order_number, estimated_time) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Limits and Continuity', 'Introduction to limits and continuous functions', 1, 10),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Derivatives', 'Understanding differentiation and its applications', 2, 15),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Integration', 'Mastering integration techniques and applications', 3, 15)
ON CONFLICT (course_id, order_number) DO NOTHING;

-- Insert sample modules for Quantum Physics course
INSERT INTO course_modules (id, course_id, title, description, order_number, estimated_time) VALUES
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Wave-Particle Duality', 'Understanding the dual nature of matter and energy', 1, 12),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Quantum Mechanics Principles', 'Core principles and mathematical framework', 2, 20),
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Applications and Systems', 'Real-world applications of quantum mechanics', 3, 28)
ON CONFLICT (course_id, order_number) DO NOTHING;

-- Insert sample lessons for Limits and Continuity module
INSERT INTO course_lessons (id, module_id, title, content, lesson_type, duration, order_number, key_points, examples) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    'Introduction to Limits',
    '# Introduction to Limits

## What is a Limit?

A limit describes the behavior of a function as its input approaches a particular value. It''s one of the fundamental concepts in calculus.

## Formal Definition

The limit of f(x) as x approaches a is L, written as:

lim(x→a) f(x) = L

This means that as x gets arbitrarily close to a, f(x) gets arbitrarily close to L.

## Intuitive Understanding

Think of limits as asking: "What value does the function approach as we get closer and closer to a specific point?"

## Examples

1. lim(x→2) (x + 1) = 3
2. lim(x→0) (sin x)/x = 1
3. lim(x→∞) 1/x = 0

## Key Properties

- Limits can exist even when the function is not defined at that point
- One-sided limits (left and right) must be equal for a limit to exist
- Limits are the foundation for derivatives and integrals',
    'text',
    30,
    1,
    ARRAY['Definition of limits', 'Limit notation', 'One-sided limits', 'Limit properties'],
    ARRAY['lim(x→2) (x + 1) = 3', 'lim(x→0) (sin x)/x = 1', 'Graphical interpretation']
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    '770e8400-e29b-41d4-a716-446655440001',
    'Evaluating Limits',
    '# Evaluating Limits

## Direct Substitution

The simplest method is to substitute the value directly into the function.

## Algebraic Techniques

When direct substitution doesn''t work:

1. **Factoring**: Factor and cancel common terms
2. **Rationalization**: Multiply by conjugate
3. **L''Hôpital''s Rule**: For indeterminate forms

## Indeterminate Forms

Common indeterminate forms:
- 0/0
- ∞/∞
- 0·∞
- ∞ - ∞

## Practice Problems

Work through various limit problems using different techniques.',
    'text',
    25,
    2,
    ARRAY['Direct substitution', 'Factoring technique', 'Rationalization', 'Indeterminate forms'],
    ARRAY['lim(x→1) (x²-1)/(x-1) = 2', 'lim(x→0) (√(x+1)-1)/x = 1/2']
  )
ON CONFLICT (module_id, order_number) DO NOTHING;

-- Insert sample lessons for Derivatives module
INSERT INTO course_lessons (id, module_id, title, content, lesson_type, duration, order_number, key_points, examples) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440003',
    '770e8400-e29b-41d4-a716-446655440002',
    'Definition of Derivative',
    '# Definition of Derivative

## What is a Derivative?

The derivative of a function measures how the function changes as its input changes. It represents the instantaneous rate of change.

## Formal Definition

The derivative of f(x) at point a is:

f''(a) = lim(h→0) [f(a+h) - f(a)]/h

## Geometric Interpretation

The derivative at a point is the slope of the tangent line to the curve at that point.

## Notation

Several notations are used:
- f''(x)
- dy/dx
- d/dx[f(x)]

## Applications

Derivatives are used in:
- Physics (velocity, acceleration)
- Economics (marginal cost, revenue)
- Optimization problems
- Related rates',
    'text',
    35,
    1,
    ARRAY['Definition of derivative', 'Geometric interpretation', 'Derivative notation', 'Real-world applications'],
    ARRAY['Slope of tangent line', 'Velocity as derivative of position', 'Marginal cost in economics']
  )
ON CONFLICT (module_id, order_number) DO NOTHING;