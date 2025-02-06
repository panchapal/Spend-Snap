'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

export default function CategorySelector({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 

  const predefinedCategories = ['Food', 'Travel', 'Utilities', 'Shopping'];

  useEffect(() => {
    const fetchCategories = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .eq('user_id', user.id);

        if (!error && data) setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && newCategory.trim()) {
      const { error } = await supabase.from('categories').insert({
        user_id: user.id,
        name: newCategory,
      });

      if (error) setMessage('Error adding category.');
      else {
        setCategories((prev) => [...prev, { name: newCategory }]);
        setNewCategory('');
        setOpen(false);
        setMessage('Category added!');
      }
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value); 
    onSelectCategory(value); 
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>Category</InputLabel>
        <Select
          label="Category"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <MenuItem value="">
            <em>Select Category</em>
          </MenuItem>
          
          {predefinedCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
         
          {categories.map((category) => (
            <MenuItem key={category.name} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button onClick={() => setOpen(true)} sx={{ mt: 2 }} variant="contained">
        Add Custom Category
      </Button>

      {message && (
        <Typography color="success.main" variant="body2" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddCategory} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
