pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template AgeCheck() {

    // INPUT
    signal input age;

    // OUTPUT
    signal output isValid;

    // We check: age >= 16

    component lt = LessThan(8);

    // lt.in[0] < lt.in[1]  → age < 16
    lt.in[0] <== age;
    lt.in[1] <== 16;

    // invert result:
    // if age < 16 → invalid (0)
    // if age >= 16 → valid (1)
    isValid <== 1 - lt.out;
}

component main = AgeCheck();
