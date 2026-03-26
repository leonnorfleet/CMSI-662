#include <iostream>
#include <string>
#include <cassert>
#include <memory>
#include <exception>

#include "stack.hpp"

using namespace std;

int main() {
    try {
        shared_ptr<Stack> s = make_shared<Stack>();

        string str = "hello world";
        s->push(str);
        cout << "push() success" << endl;

        str[0] = 'Z';
        assert(str != s->top());
        cout << "top() success" << endl;

        s->push("bread");
        s->push("water");

        assert(s->size() == 3);
        string pop_result = s->pop();
        assert(s->size() == 2);
        assert(pop_result == "water");
        cout << "size() and pop() success" << endl;

        
        Stack st(*s); // copy constructor
        string t = st.top();
        st.pop();
        assert(t == s->top());
        assert(st.size() < s->size());
        cout << "copy constructor success" << endl;

        Stack sta;
        sta.push("cookie");
        st = sta; // copy assignment operator
        assert(st.size() == 1);
        assert(st.top() == "cookie");
        cout << "copy assigmnent success" << endl;

        cout << "all tests passed" << endl;
    }
    catch (exception& e) {
        cout << "Exception caught: " << e.what() << endl;
        return 1;
    }

    return 0;
}