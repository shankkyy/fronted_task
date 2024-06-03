import React, { useEffect, useState, useMemo} from 'react';
import axios from 'axios';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import debounce from 'lodash.debounce';

const CollegeAutocomplete = () => {
    //setting up all the values using hook
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const fetchColleges = async (searchTerm) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://universities.hipolabs.com/search?name=${searchTerm}`);
      setColleges(response.data);
    } catch (error) {
      console.error("Error fetching the college names:", error);
    } finally {
      setLoading(false);
    }
  };
//to implement debounce 
  const debouncedFetchColleges = useMemo(
    () => debounce((searchTerm) => fetchColleges(searchTerm), 300),
    []
  );

  useEffect(() => {
    if (inputValue) {
      debouncedFetchColleges(inputValue);
    } else {
      setColleges([]);
    }
  }, [inputValue, debouncedFetchColleges]);

//fetch logo of the selected college
  const fetchLogo = async (domain) => {
    const logoEndpoint = `https://logo.clearbit.com/${domain}`;
    try {
      await axios.get(logoEndpoint);
      setLogoUrl(logoEndpoint);
      setLogoError(false);
    } catch (error) {
      console.error("Error fetching the logo:", error);
      setLogoUrl('');
      setLogoError(true);
    }
  };
//when we change the college
  const handleCollegeChange = (event, value) => {
    setSelectedCollege(value);
    if (value) {
      fetchLogo(value.domains[0]);
    } else {
      setLogoUrl('');
      setLogoError(false);
    }
  };

  const handleInputChange = (event, value) => {
    setInputValue(value);
  };

  return (
    <Box>
      <Autocomplete
        options={colleges}
        getOptionLabel={(option) => option.name}
        loading={loading}
        onChange={handleCollegeChange}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Select a College" 
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {selectedCollege && (
        <Box mt={2} textAlign="center">
          <Typography variant="h6">{selectedCollege.name}</Typography>
          {logoUrl ? (
            <img src={logoUrl} alt={`${selectedCollege.name} logo`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
          ) : (
            logoError && <Typography color="error">Logo could not be retrieved</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CollegeAutocomplete;
