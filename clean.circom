pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template AgeCheck() {
    signal input age;
    signal output isValid;

    component lt = LessThan(8);
    lt.in[0] <== age;
    lt.in[1] <== 16;

    isValid <== 1 - lt.out;
}

component main = AgeCheck();