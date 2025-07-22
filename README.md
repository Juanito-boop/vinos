# Wine Store - Tienda de Vinos

Una aplicación web moderna para la gestión y venta de vinos, construida con Next.js, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Gestión de inventario** con tabla de vinos interactiva
- **Tiempo real** con Supabase Realtime
- **Importación/Exportación** de datos en Excel
- **Filtros avanzados** por categoría, precio, bodega, etc.
- **Interfaz responsive** optimizada para móviles
- **Modo sin conexión** con fallback automático

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Base de datos**: Supabase (PostgreSQL)
- **Tiempo real**: Supabase Realtime
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd wine-store
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. **Verificar configuración**
   ```bash
   npm run check-supabase
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🔍 Solución de Problemas

### Error: "Wine realtime channel error - attempting retry"

Este error indica problemas con la conexión a Supabase Realtime. Sigue estos pasos:

#### 1. Verificar Variables de Entorno
```bash
npm run check-supabase
```

#### 2. Verificar Configuración de Supabase
- Ve al [Dashboard de Supabase](https://supabase.com/dashboard)
- Selecciona tu proyecto
- Navega a **Database > Replication**
- Asegúrate de que **Realtime** esté habilitado
- Verifica que la tabla `wines` esté incluida

#### 3. Verificar Políticas RLS
Ejecuta estas consultas en el SQL Editor de Supabase:

```sql
-- Permitir lectura anónima de vinos
CREATE POLICY "Allow anonymous read access to wines" ON wines
FOR SELECT USING (true);

-- Permitir gestión solo a usuarios autenticados
CREATE POLICY "Allow authenticated users to manage wines" ON wines
FOR ALL USING (auth.role() = 'authenticated');
```

#### 4. Verificar Estructura de la Base de Datos
Asegúrate de que las tablas existan:

```sql
-- Tabla principal de vinos
CREATE TABLE IF NOT EXISTS wines (
  id_vino TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT,
  nivel_alcohol DECIMAL(4,2),
  variedades TEXT[],
  pais_importacion TEXT,
  color_vino TEXT,
  capacidad TEXT,
  url_imagen TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalles de vinos
CREATE TABLE IF NOT EXISTS wine_details (
  id_detalle TEXT PRIMARY KEY,
  id_vino TEXT REFERENCES wines(id_vino) ON DELETE CASCADE,
  bodega TEXT,
  notas_cata TEXT,
  tipo_crianza TEXT,
  contenido_azucar DECIMAL(4,2),
  contenido_carbonico DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Habilitar Realtime para las Tablas
```sql
-- Habilitar realtime para la tabla wines
ALTER PUBLICATION supabase_realtime ADD TABLE wines;

-- Habilitar realtime para la tabla wine_details
ALTER PUBLICATION supabase_realtime ADD TABLE wine_details;
```

### Modo Fallback

La aplicación incluye un modo fallback que se activa automáticamente cuando hay problemas de conexión:

- Los datos se cargan desde la caché local
- Se muestra un indicador de estado en la interfaz
- Las funciones básicas siguen funcionando

## 📁 Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI base
│   ├── modales/        # Modales de la aplicación
│   └── views/          # Vistas principales
├── hooks/              # Custom hooks
├── lib/                # Utilidades y servicios
│   └── services/       # Servicios de API
├── providers/          # Context providers
├── types/              # Definiciones de TypeScript
└── utils/              # Utilidades generales
```

## 🚀 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter
- `npm run check-supabase` - Verificar configuración de Supabase

## 📖 Documentación Adicional

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Guía detallada de configuración de Supabase
- [Componentes UI](./src/components/ui/) - Documentación de componentes base

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la [documentación de Supabase](https://supabase.com/docs)
2. Consulta el archivo [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Ejecuta `npm run check-supabase` para diagnóstico
4. Abre un issue en el repositorio 