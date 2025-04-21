// 由 bin/fair_common_plugin.dart 生成
import 'package:fair/fair.dart';

/// 跟js交互的方法类
class FairCommonPlugin extends IFairPlugin with CompleterPlugin {
  factory FairCommonPlugin() => _fairCommonPlugin;
  FairCommonPlugin._();
  static final FairCommonPlugin _fairCommonPlugin = FairCommonPlugin._();
  @override
  Map<String, Function> getRegisterMethods() {
    return <String, Function>{
      'futureComplete': futureComplete,
    };
  }
}
