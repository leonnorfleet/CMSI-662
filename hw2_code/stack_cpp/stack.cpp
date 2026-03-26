#include <stdexcept>

#include "stack.hpp"

Stack::Stack() {
    for (int i = 0; i < MAX_STACK_SIZE; ++i) {
        this->elements[i] = nullptr;
    }

    this->pos = -1;
}

Stack::Stack(const Stack& s) {
    for (int i = 0; i < MAX_STACK_SIZE; ++i) {
        this->elements[i] = (s.elements[i] ? 
            std::make_shared<std::string>(*(s.elements[i])) : nullptr);   
    }

    this->pos = s.pos;
}

Stack::Stack(Stack&& s) {
    for (int i = 0; i < MAX_STACK_SIZE; ++i) {
        this->elements[i] = std::move(s.elements[i]);
    }

    this->pos = s.pos;
}

Stack::~Stack() {
    // for (int i = 0; i < MAX_STACK_SIZE; ++i) {
    //     this->elements[i] = nullptr;
    // }
}

Stack& Stack::operator=(const Stack& s) {
    if (&s == this) {
        return *this;
    }

    for (int i = 0; i < MAX_STACK_SIZE; ++i) {
        this->elements[i] = (s.elements[i] ? 
            std::make_shared<std::string>(*(s.elements[i])) : nullptr);
    }

    this->pos = s.pos;

    return *this;
}

Stack& Stack::operator=(Stack&& s) {
    if (&s == this) {
        return *this;
    }

    for (int i = 0; i < MAX_STACK_SIZE; ++i) {
        this->elements[i] = std::move(s.elements[i]);
    }

    this->pos = s.pos;

    return *this;
}

void Stack::push(const std::string& str) {
    if (this->pos >= MAX_STACK_SIZE - 1) {
        throw std::overflow_error("stack overflow");
    }

    this->pos++;
    this->elements[this->pos] = std::make_shared<std::string>(str);
}

std::string Stack::pop(){
    if (this->pos < 0) {
        throw std::underflow_error("stack underflow");
    }

    if (this->elements[this->pos] == nullptr) {
        throw std::runtime_error("null element at valid index");
    }

    std::string ret = *(this->elements[this->pos]);
    this->elements[this->pos] = nullptr;
    this->pos--;

    return ret;
}

std::string Stack::top() const {
    if (this->pos < 0) {
        throw std::underflow_error("stack is empty");
    }

    if (this->elements[this->pos] == nullptr) {
        throw std::runtime_error("null element at valid index");
    }

    return *(this->elements[this->pos]);
}

size_t Stack::size() {
    return pos + 1;
}