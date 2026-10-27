import { CsvProductRow } from '../interfaces/csv-row.interface';

export class ProductMapper {

  static mapCsvRowToProduct(row: CsvProductRow, index: number) {
    const rawName = row.name?.trim();
    const name =
      rawName && rawName.toLowerCase() !== 'nan'
        ? rawName
        : `Unnamed Product ${index + 1}`;

    const rawSku = row.sku?.trim();
    const sku =
      rawSku && rawSku.toLowerCase() !== 'nan'
        ? rawSku
        : `SKU-AUTO-${index + 1}-${Date.now().toString().slice(-4)}`;

    const description = row.description?.trim() || 'No description available';

    const price = this.cleanPrice(row.price);
    const stock = this.cleanStock(row.stock);
    const weight_kg = this.cleanWeight(row.weight_kg);
    const categoryName =
      row.category?.trim() && row.category.toLowerCase() !== 'nan'
        ? row.category.trim()
        : 'Uncategorized';

    return {
      name,
      sku,
      slug: this.slugify(name),
      description,
      price,
      stock,
      weight_kg,
      categoryName,
    };
  }

  static cleanPrice(rawPrice?: string): number {
    if (!rawPrice) return 0;
    const str = rawPrice.toString().trim().toLowerCase();
    if (str === 'free' || str === 'nan') return 0;
    const cleaned = str.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) || val < 0 ? 0 : val;
  }

  static cleanStock(rawStock?: string): number {
    if (!rawStock) return 0;
    const val = parseInt(rawStock.toString().trim(), 10);
    return isNaN(val) || val < 0 ? 0 : val;
  }

  static cleanWeight(rawWeight?: string): number {
    if (!rawWeight) return 0;
    const val = parseFloat(rawWeight.toString().trim());
    return isNaN(val) || val < 0 ? 0 : val;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}