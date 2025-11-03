export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      account_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          created_by: string
          customer_account_id: string
          id: string
          notes: string | null
          organization_id: string
          reference_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          created_by: string
          customer_account_id: string
          id?: string
          notes?: string | null
          organization_id: string
          reference_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string
          customer_account_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reference_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_transactions_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      afip_configurations: {
        Row: {
          ambiente: string
          certificado_path: string | null
          clave_privada_path: string | null
          condicion_iva: string
          created_at: string
          created_by: string
          cuit: string
          domicilio_comercial: string | null
          id: string
          is_active: boolean
          organization_id: string
          punto_venta: number
          razon_social: string
          updated_at: string
        }
        Insert: {
          ambiente?: string
          certificado_path?: string | null
          clave_privada_path?: string | null
          condicion_iva?: string
          created_at?: string
          created_by: string
          cuit: string
          domicilio_comercial?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          punto_venta?: number
          razon_social: string
          updated_at?: string
        }
        Update: {
          ambiente?: string
          certificado_path?: string | null
          clave_privada_path?: string | null
          condicion_iva?: string
          created_at?: string
          created_by?: string
          cuit?: string
          domicilio_comercial?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          punto_venta?: number
          razon_social?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "afip_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_categories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_accounts: {
        Row: {
          balance: number
          created_at: string
          credit_limit: number | null
          customer_id: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          credit_limit?: number | null
          customer_id: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          credit_limit?: number | null
          customer_id?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          cuit_dni: string | null
          email: string | null
          fiscal_address: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          tax_condition_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          cuit_dni?: string | null
          email?: string | null
          fiscal_address?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          tax_condition_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          cuit_dni?: string | null
          email?: string | null
          fiscal_address?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          tax_condition_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tax_condition_code_fkey"
            columns: ["tax_condition_code"]
            isOneToOne: false
            referencedRelation: "tax_conditions"
            referencedColumns: ["code"]
          },
        ]
      }
      invoice_tax_details: {
        Row: {
          alicuota_iva: number
          base_imponible: number
          created_at: string
          id: string
          importe_iva: number
          invoice_id: string
        }
        Insert: {
          alicuota_iva: number
          base_imponible: number
          created_at?: string
          id?: string
          importe_iva: number
          invoice_id: string
        }
        Update: {
          alicuota_iva?: number
          base_imponible?: number
          created_at?: string
          id?: string
          importe_iva?: number
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_tax_details_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cae: string | null
          created_at: string
          created_by: string
          estado: string
          fecha_emision: string
          fecha_vto_cae: string | null
          id: string
          importe_exento: number
          importe_iva: number
          importe_neto: number
          importe_total: number
          invoice_number: number
          observaciones: string | null
          organization_id: string
          pdf_path: string | null
          punto_venta: number
          qr_data: string | null
          sale_id: string
          tipo_comprobante: number
          updated_at: string
        }
        Insert: {
          cae?: string | null
          created_at?: string
          created_by: string
          estado?: string
          fecha_emision?: string
          fecha_vto_cae?: string | null
          id?: string
          importe_exento?: number
          importe_iva?: number
          importe_neto: number
          importe_total: number
          invoice_number: number
          observaciones?: string | null
          organization_id: string
          pdf_path?: string | null
          punto_venta: number
          qr_data?: string | null
          sale_id: string
          tipo_comprobante: number
          updated_at?: string
        }
        Update: {
          cae?: string | null
          created_at?: string
          created_by?: string
          estado?: string
          fecha_emision?: string
          fecha_vto_cae?: string | null
          id?: string
          importe_exento?: number
          importe_iva?: number
          importe_neto?: number
          importe_total?: number
          invoice_number?: number
          observaciones?: string | null
          organization_id?: string
          pdf_path?: string | null
          punto_venta?: number
          qr_data?: string | null
          sale_id?: string
          tipo_comprobante?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          organization_id: string
          role: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          organization_id: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          organization_id?: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          current_account_enabled: boolean
          description: string | null
          electronic_invoicing_enabled: boolean
          id: string
          name: string
          slug: string
          updated_at: string
          use_variants: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          current_account_enabled?: boolean
          description?: string | null
          electronic_invoicing_enabled?: boolean
          id?: string
          name: string
          slug: string
          updated_at?: string
          use_variants?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          current_account_enabled?: boolean
          description?: string | null
          electronic_invoicing_enabled?: boolean
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          use_variants?: boolean
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_cost_price: number | null
          new_selling_price: number | null
          old_cost_price: number | null
          old_selling_price: number | null
          organization_id: string
          product_id: string
          reason: string | null
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_cost_price?: number | null
          new_selling_price?: number | null
          old_cost_price?: number | null
          old_selling_price?: number | null
          organization_id: string
          product_id: string
          reason?: string | null
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_cost_price?: number | null
          new_selling_price?: number | null
          old_cost_price?: number | null
          old_selling_price?: number | null
          organization_id?: string
          product_id?: string
          reason?: string | null
        }
        Relationships: []
      }
      product_attribute_definitions: {
        Row: {
          attribute_name: string
          attribute_type: string
          created_at: string
          display_order: number
          id: string
          is_required: boolean
          organization_id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          attribute_name: string
          attribute_type?: string
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          organization_id: string
          product_id: string
          updated_at?: string
        }
        Update: {
          attribute_name?: string
          attribute_type?: string
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          organization_id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_attribute_values: {
        Row: {
          attribute_definition_id: string
          color_hex: string | null
          created_at: string
          display_order: number
          id: string
          value: string
        }
        Insert: {
          attribute_definition_id: string
          color_hex?: string | null
          created_at?: string
          display_order?: number
          id?: string
          value: string
        }
        Update: {
          attribute_definition_id?: string
          color_hex?: string | null
          created_at?: string
          display_order?: number
          id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attribute_values_attribute_definition_id_fkey"
            columns: ["attribute_definition_id"]
            isOneToOne: false
            referencedRelation: "product_attribute_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          attribute_name: string
          attribute_value: string
          created_at: string
          id: string
          organization_id: string
          product_id: string
        }
        Insert: {
          attribute_name: string
          attribute_value: string
          created_at?: string
          id?: string
          organization_id: string
          product_id: string
        }
        Update: {
          attribute_name?: string
          attribute_value?: string
          created_at?: string
          id?: string
          organization_id?: string
          product_id?: string
        }
        Relationships: []
      }
      product_audit: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          product_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          product_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      product_batches: {
        Row: {
          batch_date: string
          created_at: string
          created_by: string
          id: string
          notes: string | null
          organization_id: string
          product_id: string
          purchase_price: number
          quantity_purchased: number
          quantity_remaining: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          batch_date?: string
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          organization_id: string
          product_id: string
          purchase_price: number
          quantity_purchased: number
          quantity_remaining: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          batch_date?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          organization_id?: string
          product_id?: string
          purchase_price?: number
          quantity_purchased?: number
          quantity_remaining?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_variant_attributes: {
        Row: {
          attribute_definition_id: string
          attribute_value: string
          created_at: string
          id: string
          variant_combination_id: string
        }
        Insert: {
          attribute_definition_id: string
          attribute_value: string
          created_at?: string
          id?: string
          variant_combination_id: string
        }
        Update: {
          attribute_definition_id?: string
          attribute_value?: string
          created_at?: string
          id?: string
          variant_combination_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_attributes_attribute_definition_id_fkey"
            columns: ["attribute_definition_id"]
            isOneToOne: false
            referencedRelation: "product_attribute_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_attributes_variant_combination_id_fkey"
            columns: ["variant_combination_id"]
            isOneToOne: false
            referencedRelation: "product_variant_combinations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_combinations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_active: boolean
          min_stock: number
          organization_id: string
          price_adjustment: number | null
          product_id: string
          sku: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          organization_id: string
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          organization_id?: string
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          attributes: Json | null
          color: string | null
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_active: boolean
          min_stock: number
          organization_id: string
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          color?: string | null
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          organization_id: string
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          color?: string | null
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          organization_id?: string
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_sku: string | null
          category: string
          cost_price: number | null
          created_at: string
          description: string | null
          has_variants: boolean
          id: string
          min_stock: number
          name: string
          organization_id: string
          price: number
          stock: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_sku?: string | null
          category: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          has_variants?: boolean
          id?: string
          min_stock: number
          name: string
          organization_id: string
          price: number
          stock: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_sku?: string | null
          category?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          has_variants?: boolean
          id?: string
          min_stock?: number
          name?: string
          organization_id?: string
          price?: number
          stock?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_audit: {
        Row: {
          action: string
          changed_by_user_id: string
          changed_user_id: string
          created_at: string | null
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          action: string
          changed_by_user_id: string
          changed_user_id: string
          created_at?: string | null
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          action?: string
          changed_by_user_id?: string
          changed_user_id?: string
          created_at?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          cost_price: number | null
          created_at: string
          final_unit_price: number
          id: string
          margin: number | null
          price: number
          product_id: string
          product_name: string
          profit: number | null
          quantity: number
          sale_id: string
          subtotal: number
          variant_id: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          final_unit_price?: number
          id?: string
          margin?: number | null
          price: number
          product_id: string
          product_name: string
          profit?: number | null
          quantity: number
          sale_id: string
          subtotal: number
          variant_id?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          final_unit_price?: number
          id?: string
          margin?: number | null
          price?: number
          product_id?: string
          product_name?: string
          profit?: number | null
          quantity?: number
          sale_id?: string
          subtotal?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          average_margin: number | null
          created_at: string
          customer: string
          date: string
          id: string
          organization_id: string
          total: number
          total_profit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_margin?: number | null
          created_at?: string
          customer?: string
          date?: string
          id?: string
          organization_id: string
          total: number
          total_profit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_margin?: number | null
          created_at?: string
          customer?: string
          date?: string
          id?: string
          organization_id?: string
          total?: number
          total_profit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          config_key: string
          config_type: string
          config_value: Json
          created_at: string
          created_by: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_type: string
          config_value: Json
          created_at?: string
          created_by: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_type?: string
          config_value?: Json
          created_at?: string
          created_by?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_conditions: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          requires_cuit: boolean
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          requires_cuit?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          requires_cuit?: boolean
        }
        Relationships: []
      }
      user_organizations: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_attribute_definitions: {
        Row: {
          created_at: string | null
          data_type: string
          id: string
          key: string
          name: string
          options: Json | null
          organization_id: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_type?: string
          id?: string
          key: string
          name: string
          options?: Json | null
          organization_id: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          id?: string
          key?: string
          name?: string
          options?: Json | null
          organization_id?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variant_attribute_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_fifo_cost: {
        Args: {
          p_organization_id: string
          p_product_id: string
          p_quantity: number
        }
        Returns: number
      }
      clean_duplicate_products: {
        Args: { user_uuid: string }
        Returns: {
          deleted_count: number
        }[]
      }
      detect_duplicate_products: {
        Args: { user_uuid: string }
        Returns: {
          category: string
          duplicate_count: number
          product_name: string
        }[]
      }
      generate_invitation_token: { Args: never; Returns: string }
      generate_product_sku: {
        Args: { category: string; org_id: string; product_name: string }
        Returns: string
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
      generate_variant_sku: {
        Args: {
          base_sku: string
          color?: string
          org_id?: string
          size?: string
        }
        Returns: string
      }
      get_organization_by_slug: {
        Args: { org_slug: string }
        Returns: {
          description: string
          id: string
          name: string
          slug: string
        }[]
      }
      get_product_total_stock: {
        Args: { p_product_id: string }
        Returns: number
      }
      get_user_default_organization: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_roles: {
        Args: { user_uuid?: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          last_sign_in_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_organization_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      migrate_organization_categories: {
        Args: { _org_id: string }
        Returns: undefined
      }
      update_batches_after_sale: {
        Args: {
          p_organization_id: string
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      update_variant_batches_after_sale: {
        Args: {
          p_organization_id: string
          p_product_id: string
          p_quantity: number
          p_variant_id: string
        }
        Returns: undefined
      }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      product_category:
        | "mascotas"
        | "forrajeria"
        | "electronica"
        | "ropa"
        | "hogar"
        | "alimentacion"
        | "salud"
        | "deportes"
        | "libros"
        | "vehiculos"
        | "servicios"
        | "otros"
        | "informatica"
        | "accesorios_tecnologia"
        | "electrodomesticos"
        | "ferreteria"
        | "construccion"
        | "textil"
        | "calzado"
        | "juguetes"
        | "jardineria"
        | "automotriz"
        | "bebidas"
        | "limpieza"
        | "veterinarios"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "user"],
      product_category: [
        "mascotas",
        "forrajeria",
        "electronica",
        "ropa",
        "hogar",
        "alimentacion",
        "salud",
        "deportes",
        "libros",
        "vehiculos",
        "servicios",
        "otros",
        "informatica",
        "accesorios_tecnologia",
        "electrodomesticos",
        "ferreteria",
        "construccion",
        "textil",
        "calzado",
        "juguetes",
        "jardineria",
        "automotriz",
        "bebidas",
        "limpieza",
        "veterinarios",
      ],
    },
  },
} as const
