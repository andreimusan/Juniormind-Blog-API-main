export default class ServiceInjector {
  public static services = new Map();

  static getService<T>(service: string): T {
    return this.services.get(service);
  }

  static registerService<K, V>(key: K, value: V) {
    this.services.set(key, value);
  }
}
