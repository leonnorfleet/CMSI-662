#include "stack.h"

#include <stdlib.h>
#include <string.h>

#define MAX_STACK_SIZE 16

typedef struct StackImpl {
    char *elements[MAX_STACK_SIZE];
    size_t top;
} *Stack;

StackResult create_stack() {
    Stack s = (Stack)malloc(sizeof(*s));

    if (s == nullptr)
    {
        return (StackResult){out_of_memory, nullptr};
    }

    s->top = -1;
    for (int i = 0; i < MAX_STACK_SIZE; ++i)
    {
        s->elements[i] = nullptr;
    }

    return (StackResult){ok, s};
}

status_code push(Stack s, const char *str) {
    if (s == nullptr)
    {
        return null_stack;
    }

    if (str == nullptr) {
        return null_str;
    }

    if (s->top >= MAX_STACK_SIZE - 1)
    {
        return stack_overflow;
    }

    s->top++;
    char* new_str = strdup(str);

    if (new_str == nullptr) {
        return null_str;
    }

    s->elements[s->top] = new_str;

    return ok;
}

StringResult pop(Stack s) {
    if (s == nullptr)
    {
        return (StringResult){null_stack, nullptr};
    }

    else if (s->top < 0)
    {
        return (StringResult){stack_underflow, nullptr};
    }

    char *ret = strdup(s->elements[s->top]);

    if (ret == nullptr) {
        return (StringResult){null_str, nullptr};
    }

    free(s->elements[s->top]);

    s->elements[s->top] = nullptr;
    s->top--;

    return (StringResult){ok, ret};
}

StringResult top(Stack s) {
    if (s == nullptr)
    {
        return (StringResult){null_stack, nullptr};
    }

    else if (s->top < 0)
    {
        return (StringResult){stack_underflow, nullptr};
    }

    char *ret = strdup(s->elements[s->top]);

    if (ret == nullptr) {
        return (StringResult){null_str, nullptr};
    }

    return (StringResult){ok, ret};
}

size_t size(Stack s) {
    if (s == nullptr) {
        return -1;
    }

    return s->top + 1;
}

status_code destroy_stack(Stack s) {
    if (s == nullptr)
    {
        return null_stack;
    }

    for (int i = 0; i < MAX_STACK_SIZE; ++i)
    {
        free(s->elements[i]);
        s->elements[i] = nullptr;
    }

    free(s);
    s = nullptr;

    return ok;
}