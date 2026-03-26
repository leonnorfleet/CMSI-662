#ifndef STACK_HPP
#define STACK_HPP

#include <string>
#include <memory>

#define MAX_STACK_SIZE 16

class Stack {
    private:
        size_t pos;
        std::shared_ptr<std::string> elements[MAX_STACK_SIZE];

    public:
        Stack();
        Stack(const Stack& s); // copy constructor
        Stack(Stack&& s); // move constructor
        ~Stack();

        Stack& operator=(const Stack& s); // copy assignment operator
        Stack& operator=(Stack&& s); // move assignment operator

        void push(const std::string& str);
        std::string pop();
        std::string top() const;
        size_t size();
};

#endif