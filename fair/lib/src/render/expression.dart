/*
 * Copyright (C) 2005-present, 58.com.  All rights reserved.
 * Use of this source code is governed by a BSD type license that can be
 * found in the LICENSE file.
 */

import 'package:fair/src/render/domain.dart';
import 'package:flutter/foundation.dart';

import '../internal/bind_data.dart';
import 'proxy.dart';

class R {
  final dynamic data;
  final String? exp;
  static R? _empty;
  final bool? needBinding;

  R(this.data, {this.exp, this.needBinding = false});

  factory R.empty() {
    return _empty ?? (_empty = R(null, exp: null, needBinding: false));
  }

  bool valid() {
    return data != null;
  }
}

abstract class Expression {
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre);

  /// fail-fast
  bool hitTest(String? exp, String? pre);
}

class ComponentExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding,Domain? domain, String? exp, String? pre) {
    var processed = exp?.substring(2, exp.length - 1);
    var widget = proxy?.componentOf(processed);
    if (widget != null) return R(widget, exp: processed);
    if (processed?.contains('.') == true) {
      var s = processed!.split('.');
      assert(s.length == 2, 'expression is not supported => $exp');
      var obj = s[0];
      var prop = s[1];
      var r = proxy!.componentOf(obj);
      if (r is Map) {
        assert(!(r[prop] is Function),
            'should be an instance of widget or const value');
        return R(r[prop], exp: processed);
      }
    }
    return R(null, exp: processed);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp('#\\(.+\\)', multiLine: true).hasMatch(exp ?? '');
  }
}

class InlineExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var regexp = RegExp(r'\$\w+');
    var matches = regexp.allMatches(pre ?? '');
    var builder = _InlineVariableBuilder(
        matches: matches, data: pre, proxyMirror: proxy, binding: binding);
    binding?.addBindValue(builder);
    return R(builder, exp: exp, needBinding: true);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp(r'\$\w+', multiLine: true).hasMatch(pre ?? '');
  }
}

class InlineObjectExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var regexp = RegExp(r'\$\{\w.+\}');
    var matches = regexp.allMatches(pre ?? '');
    var builder = _InlineObjectVariableBuilder(
        matches: matches, data: pre, proxyMirror: proxy, binding: binding);
    binding?.addBindValue(builder);
    return R(builder, exp: exp, needBinding: true);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp(r'\$\{\w.+\}', multiLine: true).hasMatch(pre ?? '');
  }
}

class WidgetParamExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var widgetParameter = exp?.substring(9, exp.length - 1);
    var value = binding?.dataOf(widgetParameter ?? '');
    if (value != null) {
      return R(value, exp: widgetParameter);
    }
    return R(null, exp: widgetParameter);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp('#\\(widget\..+\\)', multiLine: true).hasMatch(exp ?? '');
  }
}

class ValueExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var prop = binding?.bindDataOf(pre ?? '') ??
        binding?.modules?.moduleOf(pre ?? '')?.call();
    if (prop is FairValueNotifier) {
      var data = _PropBuilder(pre ?? '', prop, proxy, binding);
      binding?.addBindValue(data);
      return R(data, exp: exp, needBinding: true);
    }
    return R(prop, exp: exp, needBinding: false);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return true;
  }
}

class FunctionExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var regexp = RegExp(r'\%\(.+\)');
    var matches = regexp.allMatches(exp ?? '');
    var builder = _FunctionBuilder(
        matches: matches, domain: domain, data: exp, proxyMirror: proxy, binding: binding);
    binding?.addBindValue(builder);
    return R(builder, exp: exp, needBinding: false);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp(r'\%\(.+\)', multiLine: false).hasMatch(exp ?? '');
  }
}

class GestureExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var prop = binding?.bindFunctionOf(exp?.substring(2, exp.length - 1) ?? '');
    return R(prop, exp: exp, needBinding: false);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp(r'\@\(\w+\)', multiLine: false).hasMatch(exp ?? '');
  }
}

class PropValueExpression extends Expression {
  @override
  R onEvaluate(
      ProxyMirror? proxy, BindingData? binding, Domain? domain, String? exp, String? pre) {
    var expression = exp?.substring(2, exp.length - 1);
    var prop = binding?.bindRuntimeValueOf(expression ?? '');
    return R(prop, exp: expression, needBinding: false);
  }

  @override
  bool hitTest(String? exp, String? pre) {
    return RegExp(r'\^\(\w+\)', multiLine: false).hasMatch(exp ?? '');
  }
}

class _BindValueBuilder<T> extends FairValueNotifier<T?> implements LifeCircle {
  final String? data;
  final ProxyMirror? proxyMirror;
  final BindingData? binding;
  VoidCallback? _listener;
  final List<FairValueNotifier> _watchedProps = [];

  _BindValueBuilder(this.data, this.proxyMirror, this.binding) : super(null);

  @override
  void attach() {
    final listener = _listener ??
        (_listener = () {
          notifyListeners();
        });
    _watchedProps.forEach((e) {
      e.addListener(listener);
    });
  }

  @override
  void detach() {
    if (_listener == null) return;
    _watchedProps.forEach((e) {
      e.removeListener(_listener!);
    });
  }
}

class _InlineVariableBuilder extends _BindValueBuilder<String> {
  final Iterable<RegExpMatch>? matches;

  _InlineVariableBuilder(
      {this.matches,
      String? data,
      ProxyMirror? proxyMirror,
      BindingData? binding})
      : super(data, proxyMirror, binding) {
    matches?.forEach((e) {
      final bindProp = binding?.bindRuntimeValueOf(e.group(0)!.substring(1));
      if (bindProp is FairValueNotifier) {
        _watchedProps.add(bindProp);
      }
    });
    attach();
  }

  @override
  String get value {
    var extract = data;
    matches
        ?.map((e) => {
              '0': binding?.bindRuntimeValueOf(e.group(0)?.substring(1) ?? ''),
              '1': e.group(0)
            })
        .forEach((e) {
      var first = e['0'] is FairValueNotifier ? e['0'].value : e['0'];
      if (first != null) {
        extract = extract?.replaceFirst(e['1'], '$first');
      }
    });
    return extract ?? '';
  }
}

class _InlineObjectVariableBuilder extends _BindValueBuilder<String> {
  final Iterable<RegExpMatch>? matches;

  _InlineObjectVariableBuilder(
      {this.matches,
      String? data,
      ProxyMirror? proxyMirror,
      BindingData? binding})
      : super(data, proxyMirror, binding) {
    matches?.forEach((e) {
      final bindProp = binding?.bindRuntimeValueOf(
          e.group(0)!.substring(2, e.group(0)!.length - 1));
      if (bindProp is FairValueNotifier) {
        _watchedProps.add(bindProp);
      }
    });
    attach();
  }

  @override
  String get value {
    var extract = data;
    matches
        ?.map((e) => {
              '0': binding?.bindRuntimeValueOf(
                  e.group(0)!.substring(2, e.group(0)!.length - 1)),
              '1': e.group(0)
            })
        .forEach((e) {
      var first = e['0'] is FairValueNotifier ? e['0'].value : e['0'];
      if (first != null) {
        extract = extract?.replaceFirst(e['1'], '$first');
      }
    });
    return extract ?? '';
  }
}

class _PropBuilder extends _BindValueBuilder {
  _PropBuilder(String data, FairValueNotifier prop, ProxyMirror? proxyMirror,
      BindingData? binding)
      : super(data, proxyMirror, binding) {
    _watchedProps.add(prop);
    attach();
  }

  @override
  dynamic get value {
    final prop = binding?.bindDataOf(data ?? '');
    return prop is FairValueNotifier ? prop.value : prop;
  }
}

class _PropValueBuilder extends _BindValueBuilder {
  final prop;

  _PropValueBuilder(
      String data, this.prop, ProxyMirror proxyMirror, BindingData binding)
      : super(data, proxyMirror, binding) {
    _watchedProps.add(prop);
    attach();
  }

  @override
  dynamic get value {
    return prop is FairValueNotifier ? prop.value : prop;
  }
}

class _FunctionBuilder extends _BindValueBuilder {
  final Iterable<RegExpMatch>? matches;
  final Domain? domain;

  _FunctionBuilder(
      {this.matches, this.domain,
      String? data,
      ProxyMirror? proxyMirror,
      BindingData? binding})
      : super(data, proxyMirror, binding) {
    matches?.forEach((e) {
      var bindProp;
      bindProp = binding
          ?.runFunctionOf(e.group(0)!.substring(2, e.group(0)!.length - 1), proxyMirror, binding, domain);
      if (bindProp is FairValueNotifier) {
        _watchedProps.add(bindProp);
      }
    });
    attach();
  }

  @override
  dynamic get value {
    var extract;
    matches
        ?.map((e) => {
              '0': binding?.runFunctionOf(
                  e.group(0)!.substring(2, e.group(0)!.length - 1), proxyMirror, binding, domain),
              '1': e.group(0)
            })
        .forEach((e) {
      var first = e['0'] is FairValueNotifier ? e['0'].value : e['0'];
      if (first != null) {
        extract = first; // extract.replaceFirst(e['1'], '$first');
      } else {
        extract = data;
      }
    });
    return extract;
  }
}

abstract class LifeCircle {
  void attach();

  // should be invoked when context invalid
  void detach();
}
