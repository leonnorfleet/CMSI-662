#ifndef STACK_H
#define STACK_H

typedef struct StackImpl* Stack;

typedef enum {
    ok,
    out_of_memory,
    stack_overflow,
    stack_underflow,
    null_stack,
    null_str
} status_code;

typedef struct {
    status_code code;
    Stack stack;
} StackResult;

typedef struct {
    status_code code;
    const char *message;
} StringResult;

StackResult create_stack();

status_code push(Stack s, const char *str);

StringResult pop(Stack s);

StringResult top(Stack s);

size_t size(Stack s);

status_code destroy_stack(Stack s);

#endif