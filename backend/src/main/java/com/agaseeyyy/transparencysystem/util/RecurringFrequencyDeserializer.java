package com.agaseeyyy.transparencysystem.util;

import com.agaseeyyy.transparencysystem.expenses.Expenses.RecurringFrequency;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;

/**
 * Custom deserializer for RecurringFrequency to handle empty strings
 */
public class RecurringFrequencyDeserializer extends StdDeserializer<RecurringFrequency> {
    
    private static final long serialVersionUID = 1L;

    public RecurringFrequencyDeserializer() {
        super(RecurringFrequency.class);
    }

    @Override
    public RecurringFrequency deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return RecurringFrequency.valueOf(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
