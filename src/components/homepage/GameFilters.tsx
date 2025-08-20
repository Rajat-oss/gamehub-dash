import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FaFilter, FaTimes } from 'react-icons/fa';

export interface GameFilters {
  genre: string;
  platform: string;
  rating: string;
}

interface GameFiltersProps {
  filters: GameFilters;
  onFilterChange: (filters: GameFilters) => void;
  onClearFilters: () => void;
}

const genres = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 
  'Racing', 'Puzzle', 'Shooter', 'Fighting', 'Horror', 'Platformer'
];

const platforms = [
  'PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'VR'
];

const ratings = [
  { value: '4+', label: '4+ Stars' },
  { value: '3+', label: '3+ Stars' },
  { value: '2+', label: '2+ Stars' }
];

export const GameFilters: React.FC<GameFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = (filters.genre && filters.genre !== 'all') || (filters.platform && filters.platform !== 'all') || (filters.rating && filters.rating !== 'all');

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-primary" />
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            <FaTimes className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Genre Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Genre</label>
          <Select
            value={filters.genre}
            onValueChange={(value) => {
              const newFilters = { ...filters, genre: value };
              onFilterChange(newFilters);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre.toLowerCase()}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Platform</label>
          <Select
            value={filters.platform}
            onValueChange={(value) => {
              const newFilters = { ...filters, platform: value };
              onFilterChange(newFilters);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map(platform => (
                <SelectItem key={platform} value={platform.toLowerCase()}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Rating</label>
          <Select
            value={filters.rating}
            onValueChange={(value) => {
              const newFilters = { ...filters, rating: value };
              onFilterChange(newFilters);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              {ratings.map(rating => (
                <SelectItem key={rating.value} value={rating.value}>
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.genre && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Genre: {genres.find(g => g.toLowerCase() === filters.genre)}
              <FaTimes 
                className="w-3 h-3 cursor-pointer hover:text-red-400" 
                onClick={() => onFilterChange({ ...filters, genre: '' })}
              />
            </Badge>
          )}
          {filters.platform && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Platform: {platforms.find(p => p.toLowerCase() === filters.platform)}
              <FaTimes 
                className="w-3 h-3 cursor-pointer hover:text-red-400" 
                onClick={() => onFilterChange({ ...filters, platform: '' })}
              />
            </Badge>
          )}
          {filters.rating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Rating: {ratings.find(r => r.value === filters.rating)?.label}
              <FaTimes 
                className="w-3 h-3 cursor-pointer hover:text-red-400" 
                onClick={() => onFilterChange({ ...filters, rating: '' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};