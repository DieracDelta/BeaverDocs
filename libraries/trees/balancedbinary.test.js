const bbt = require('./balancedbinary');

test('Testing constructor null rep', () => {
    var test = new bbt.BalancedBinaryTree(null, null, null, null);
    expect(test.rep).toBeNull();
    expect(test.leftChild).toBeNull();
    expect(test.rightChild).toBeNull();
    expect(test.parent).toBeNull();
});

// TODO non-null test