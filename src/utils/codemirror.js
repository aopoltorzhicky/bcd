import CodeMirror from 'codemirror'

export function create() {
    CodeMirror.defineSimpleMode("michelson", {
        start: [
            // delimiters
            { regex: /[;{(]/, token: "builtin", next: "start" },
            // string
            { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
            // bytes
            { regex: /(?<=\s|^)(?:0x[0-9a-f]+)(?=\s|;|\}|$)/i, token: "string" },
            // int
            { regex: /(?<=\s|^)(?:[+-]?[0-9]+\.?[0-9]*)(?=\s|;|\}|$)/, token: "string" },
            // comment
            { regex: /#.*/, token: "comment" },
            { regex: /\/\*/, token: "comment", next: "comment" },
            // block
            { regex: /(?<=\s|^)(?:parameter|storage|code)(?=\s|$)/, token: "atom" },
            // data
            { regex: /(?<=\s|^)(?:Unit|True|False|Pair|Left|Right|Some|None|Elt)(?=\s|;|\)|$)/, token: "keyword" },
            // instruction
            { regex: /(?<=\s|^)(?:CAST|RENAME|DROP|DUP|SWAP|PUSH|SOME|NONE|UNIT|IF_NONE|PAIR|CAR|CDR|LEFT|RIGHT|IF_LEFT|IF_RIGHT|NIL|CONS|IF_CONS|SIZE|EMPTY_SET|EMPTY_MAP|MAP|ITER|MEM|GET|UPDATE|IF|LOOP|LOOP_LEFT|LAMBDA|EXEC|DIP|FAILWITH|CONCAT|SLICE|PACK|UNPACK|ADD|SUB|MUL|EDIV|ABS|NEG|LSL|LSR|OR|AND|XOR|NOT|COMPARE|EQ|NEQ|LT|GT|LE|GE|CHECK_SIGNATURE|BLAKE2B|SHA256|SHA512|HASH_KEY|DIG|DUG|EMPTY_BIG_MAP|APPLY)(?=\s|;|\}|$)/, token: "keyword" },
            { regex: /(?<=\s|^)(?:SELF|CONTRACT|TRANSFER_TOKENS|SET_DELEGATE|CREATE_CONTRACT|IMPLICIT_ACCOUNT|NOW|AMOUNT|BALANCE|STEPS_TO_QUOTA|SOURCE|SENDER|ADDRESS|CHAIN_ID)(?=\s|;|\}|$)/, token: "atom" },
            // type
            { regex: /(?<=\s|^)(?:option|list|set|contract|pair|or|lambda|map|big_map)(?=\s|\)|$)/, token: "tag" },
            { regex: /(?<=\s|^)(?:key|unit|signature|operation|address|int|nat|string|bytes|mutez|bool|key_hash|timestamp|chain_id)(?=\s|\)|\}|;|$)/, token: "variable" },
            // macros
            { regex: /(?<=\s|^)(?:IF_SOME|FAIL|ASSERT|ASSERT_NONE|ASSERT_SOME|ASSERT_LEFT|ASSERT_RIGHT|UNPAIR|(?:SET|MAP)_C[AD]+R)(?=\s|;|\}|$)/, token: "string-2" },
            { regex: /(?<=\s|^)(?:DII+P|C[AD]{2,}R|DUU+P|P[PAI]{3,}R|UNP[PAI]{3,}R)(?=\s|;|\}|$)/, token: "string-2" },
            { regex: /(?<=\s|^)(?:(?:CMP|IF|IFCMP|ASSERT_|ASSERT_CMP)(?:EQ|NEQ|LT|GT|LE|GE))(?=\s|;|\}|\{|$)/, token: "string-2" },
            // annotations
            { regex: /(?<=\s|^)(?:%[A-z_0-9%@]*)(?=\s|$|\))/, token: "comment" },
            { regex: /(?<=\s|^)(?:@[A-z_0-9%]+)(?=\s|$|\))/, token: "comment" },
            { regex: /(?<=\s|^)(?::[A-z_0-9]+)(?=\s|$|\))/, token: "comment" },
            // fallback
            { regex: /[^\s]+/, token: "builtin" }
        ],
        comment: [
            { regex: /.*?\*\//, token: "comment", next: "start" },
            { regex: /.*/, token: "comment" }
        ],
        meta: {
            dontIndentStates: ["comment"],
            lineComment: "#",
            blockCommentStart: "/*",
            blockCommentEnd: "*/"
        }
    });
    return CodeMirror;
}
