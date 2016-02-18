/// <reference path="../../node_modules/typescript/bin/typescriptServices.d.ts" />
/// <reference path="../../node_modules/gulp-tslint/node_modules/tslint/lib/tslint.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var typedefWalker = new TypedefWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(typedefWalker);
    };
    Rule.FAILURE_STRING = "missing type declaration";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var TypedefWalker = (function (_super) {
    __extends(TypedefWalker, _super);
    function TypedefWalker() {
        _super.apply(this, arguments);
    }
    TypedefWalker.prototype.visitMethodDeclaration = function (node) {
        var _this = this;
        if (node.name.getText().charAt(0) !== '_') {
            node.parameters.forEach(function (p) {
                // a parameter's "type" could be a specific string value, for example `fn(option:
                // "someOption", anotherOption: number)`
                if (p.type == null || p.type.kind !== 8 /* StringLiteral */) {
                    _this.checkTypeAnnotation(p.getEnd(), p.type, p.name);
                }
            });
        }
        _super.prototype.visitMethodDeclaration.call(this, node);
    };
    TypedefWalker.prototype.checkTypeAnnotation = function (location, typeAnnotation, name) {
        if (typeAnnotation == null) {
            var ns = "<name missing>";
            if (name != null && name.kind === 65 /* Identifier */) {
                ns = name.text;
            }
            if (ns.charAt(0) === '_')
                return;
            var failure = this.createFailure(location, 1, "expected parameter " + ns + " to have a type");
            this.addFailure(failure);
        }
    };
    return TypedefWalker;
})(Lint.RuleWalker);
//# sourceMappingURL=requireParameterTypeRule.js.map