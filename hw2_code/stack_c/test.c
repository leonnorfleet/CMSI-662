#include <stdio.h>
#include <assert.h>
#include <string.h>

#include "stack.h"

int main (int argc, char** argv) {
    StackResult stack_result = create_stack();
    assert(stack_result.code == ok);
    puts("create_stack() success");

    Stack s = stack_result.stack;
    Stack bad = nullptr;

    push(s, "first");
    push(s, "second");
    
    StringResult top_result = top(s);
    assert(strcmp(top_result.message, "second") == 0);

    StringResult bad_top_result = top(bad);
    assert(bad_top_result.code == null_stack && bad_top_result.message == nullptr);
    puts("top() success");
    

    status_code push_result = push(s, "hello");
    assert(push_result == ok);
    
    status_code bad_push_result = push(bad, "nope");
    assert(bad_push_result = null_stack);
    puts("push() success");


    assert(size(s) == 3);
    assert(size(bad) == -1);

    StringResult pop_result = pop(s);
    assert(pop_result.code == ok);
    assert(strcmp(pop_result.message, "hello") == 0);
    assert(size(s) == 2);

    StringResult bad_pop_result = pop(bad);
    assert(bad_pop_result.code == null_stack && bad_pop_result.message == nullptr);
    puts("size() and pop() success");

    
    destroy_stack(s);
    destroy_stack(bad);
    assert(bad == nullptr);
    puts("destroy_stack() success");

    puts("all tests passed!");

    return 0;
}