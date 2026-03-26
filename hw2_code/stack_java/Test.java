class Test {
    public static void main(String[] args) {
        try {
            Stack s = new Stack();
            
            s.push("testing");
            assert s.top() == "testing";
            System.out.println("top() success");

            s.push("word1");
            s.push("word2");
            assert s.size() == 3;
            System.out.println("size() and push() success");

            assert s.pop() == "word2";
            assert s.size() == 2;
            System.out.println("pop() success");

            System.out.println("all tests passed");

        }
        catch (Exception e) {
            System.out.printf("Something went wrong: %s%n", e.getMessage());
        }
    }
}