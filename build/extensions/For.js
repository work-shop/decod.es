module.exports = function( ignored ) {
  var ctx = '_ctx.',
  ctxloop = ctx + 'loop';

  ignored = ignored.map( function( x ) { return '\"' + x + '\"'; });

  return {
        compile: function (compiler, args, content, parents, options, blockName) {
            var val = args.shift(),
            key = '__k',
            ctxloopcache = (ctx + '__loopcache' + Math.random()).replace(/\./g, ''),
            last;

            if (args[0] && args[0] === ',') {
            args.shift();
            key = val;
            val = args.shift();
            }

            last = args.join('');

            return [
            '(function () {\n',
            '  var __l = ' + last + ', __len = (_utils.isArray(__l) || typeof __l === "string") ? __l.length : _utils.keys(__l).length;\n',
            '  if (!__l) { return; }\n',
            '    var ' + ctxloopcache + ' = { loop: ' + ctxloop + ', ' + val + ': ' + ctx + val + ', ' + key + ': ' + ctx + key + ' };\n',
            '    ' + ctxloop + ' = { first: false, index: 1, index0: 0, revindex: __len, revindex0: __len - 1, length: __len, last: false };\n',
            '  _utils.each(__l, function (' + val + ', ' + key + ') {\n',
            '    ' + 'if (['+ ignored.join(',') +'].indexOf(' + key + ') === -1 ) {',
            '    ' + ctx + val + ' = ' + val + ';\n',
            '    ' + ctx + key + ' = ' + key + ';\n',
            '    ' + ctxloop + '.key = ' + key + ';\n',
            '    ' + ctxloop + '.first = (' + ctxloop + '.index0 === 0);\n',
            '    ' + ctxloop + '.last = (' + ctxloop + '.revindex0 === 0);\n',
            '    ' + compiler(content, parents, options, blockName),
            '    ' + ctxloop + '.index += 1; ' + ctxloop + '.index0 += 1; ' + ctxloop + '.revindex -= 1; ' + ctxloop + '.revindex0 -= 1;\n',
            '    }', 
            '  });\n',
            '  ' + ctxloop + ' = ' + ctxloopcache + '.loop;\n',
            '  ' + ctx + val + ' = ' + ctxloopcache + '.' + val + ';\n',
            '  ' + ctx + key + ' = ' + ctxloopcache + '.' + key + ';\n',
            '  ' + ctxloopcache + ' = undefined;\n',
            '})();\n'
            ].join('');
        },

        parse: function (str, line, parser, types) {
            var firstVar, ready;

            parser.on(types.NUMBER, function (token) {
            var lastState = this.state.length ? this.state[this.state.length - 1] : null;
            if (!ready ||
                (lastState !== types.ARRAYOPEN &&
                  lastState !== types.CURLYOPEN &&
                  lastState !== types.CURLYCLOSE &&
                  lastState !== types.FUNCTION &&
                  lastState !== types.FILTER)
                ) {
              throw new Error('Unexpected number "' + token.match + '" on line ' + line + '.');
            }
            return true;
            });

            parser.on(types.VAR, function (token) {
            if (ready && firstVar) {
              return true;
            }

            if (!this.out.length) {
              firstVar = true;
            }

            this.out.push(token.match);
            });

            parser.on(types.COMMA, function (token) {
            if (firstVar && this.prevToken.type === types.VAR) {
              this.out.push(token.match);
              return;
            }

            return true;
            });

            parser.on(types.COMPARATOR, function (token) {
            if (token.match !== 'in' || !firstVar) {
              throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
            }
            ready = true;
            this.filterApplyIdx.push(this.out.length);
            });

            return true;
        },
        ends: true
    };

};

