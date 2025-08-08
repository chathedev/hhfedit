"use client"

import { useTina } from "tinacms/dist/react"
import { useDocument } from "tinacms/dist/react"
import { useEffect, useState } from "react"

interface EditableFieldProps {
  filePath: string
  field: string
  component?: React.ElementType
  className?: string
}

export function EditableField({ filePath, field, component: Component = "span", className }: EditableFieldProps) {
  const { TinaCMS, active } = useTina()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use useDocument to fetch content from TinaCMS
  const [data, query] = useDocument({
    collection: filePath.split('/')[1], // Assumes filePath is like "content/home.json"
    relativePath: filePath.split('/').pop() || '',
  });

  useEffect(() => {
    if (data && data.data) {
      setContent(data.data[filePath.split('/')[1]][field]);
      setLoading(false);
    } else if (query && query.error) {
      setError("Failed to load content.");
      setLoading(false);
    }
  }, [data, query, field, filePath]);

  if (loading) {
    return <Component className={className}>Loading...</Component>;
  }

  if (error) {
    return <Component className={className}>{error}</Component>;
  }

  if (active) {
    // When TinaCMS is active, render the editable field
    return (
      <Component
        className={className}
        data-tina-field={TinaCMS.fields.get(field)?.name} // This might need adjustment based on Tina's internal field naming
      >
        {content}
      </Component>
    )
  } else {
    // When TinaCMS is not active, render static content
    return <Component className={className}>{content}</Component>
  }
}
