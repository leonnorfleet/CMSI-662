public class Stack {
    public static final int MAX_STACK_SIZE = 16;
    private int pos;
    private final String[] elements;

    Stack() {
        elements = new String[MAX_STACK_SIZE];
        pos = -1;
    }

    void push(final String str) {
        if (str == null) {
            throw new NullPointerException("invalid str argument");
        }

        if (pos >= MAX_STACK_SIZE - 1) {
            throw new IllegalStateException("stack overflow");
        }

        pos++;
        elements[pos] = str;
    }

    String pop() {
        if (pos < 0) {
            throw new IllegalStateException("stack underflow");
        }

        String ret = elements[pos];
        elements[pos] = null;
        pos--;

        return ret;
    }

    String top() {
        if (pos < 0) {
            throw new IllegalStateException("stack is empty");
        }

        return elements[pos];
    }

    int size() {
        return pos + 1;
    }
}