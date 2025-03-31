#!/usr/bin/env node
import { Command } from 'commander';
import { ScrapingMonitor, ScrapingResult } from '../services/monitoring/ScrapingMonitor';
import { ParserValidator } from '../services/validation/ParserValidator';
import { RecipeParser } from '../services/RecipeParser';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import nodemailer from 'nodemailer';

const program = new Command();

program
  .name('recipe-scraper')
  .description('CLI tool for managing recipe scrapers')
  .version('1.0.0');

program
  .command('test')
  .description('Test recipe scrapers against sample URLs')
  .option('-p, --parser <name>', 'Test specific parser')
  .option('-u, --url <url>', 'Test specific URL')
  .option('--email <email>', 'Send results to email')
  .action(async (options) => {
    const spinner = ora('Testing recipe scrapers').start();
    
    try {
      const results: ScrapingResult[] = [];
      const startTime = Date.now();

      if (options.url) {
        // Test single URL
        const result = await testUrl(options.url);
        results.push(result);
      } else {
        // Test sample URLs for each parser
        const sampleUrls = getSampleUrls(options.parser);
        for (const [parser, url] of sampleUrls) {
          const result = await testUrl(url);
          results.push(result);
        }
      }

      spinner.succeed('Testing completed');
      
      // Display results
      displayResults(results);

      // Send email if requested
      if (options.email) {
        await sendResultsEmail(options.email, results);
      }
    } catch (error) {
      spinner.fail('Testing failed');
      console.error(chalk.red('Error:'), error);
    }
  });

program
  .command('stats')
  .description('Show parser statistics')
  .option('-p, --parser <name>', 'Show stats for specific parser')
  .option('-d, --days <number>', 'Show stats for last N days', '7')
  .action(async (options) => {
    const spinner = ora('Fetching parser statistics').start();
    
    try {
      const stats = await ScrapingMonitor.getParserStats(options.parser);
      const logs = await ScrapingMonitor.getRecentScrapingLogs(100, options.parser);
      
      spinner.succeed('Statistics fetched');
      
      displayStats(stats, logs);
    } catch (error) {
      spinner.fail('Failed to fetch statistics');
      console.error(chalk.red('Error:'), error);
    }
  });

async function testUrl(url: string): Promise<ScrapingResult> {
  const startTime = Date.now();
  
  try {
    const parser = RecipeParser.validateUrl(url);
    if (!parser.isValid) {
      throw new Error(parser.error || 'Invalid URL');
    }

    const result = await RecipeParser.parseUrl(url);
    if (!result.success || !result.recipe) {
      throw new Error(result.error?.message || 'Failed to parse recipe');
    }

    const validationResult = ParserValidator.validateRecipe(result.recipe);
    
    const scrapingResult: ScrapingResult = {
      url,
      parserName: parser.source || 'unknown',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      success: result.success && validationResult.isValid,
      validationResult,
      error: result.error?.message
    };

    await ScrapingMonitor.logScrapingResult(scrapingResult);
    return scrapingResult;
  } catch (error) {
    return {
      url,
      parserName: 'unknown',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      success: false,
      validationResult: {
        isValid: false,
        errors: [{
          field: 'parser',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'PARSER_ERROR'
        }],
        warnings: []
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function getSampleUrls(parserName?: string): Array<[string, string]> {
  const sampleUrls: Array<[string, string]> = [
    ['AllRecipes', 'https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/'],
    ['Epicurious', 'https://www.epicurious.com/recipes/food/views/classic-chocolate-mousse-107768'],
    ['Food.com', 'https://www.food.com/recipe/perfect-pancakes-25690'],
    ['Serious Eats', 'https://www.seriouseats.com/classic-french-omelette-recipe'],
    ['Simply Recipes', 'https://www.simplyrecipes.com/recipes/classic_beef_chili/'],
    ['Yummly', 'https://www.yummly.com/recipe/Classic-Deviled-Eggs-2046153'],
    ['Taste of Home', 'https://www.tasteofhome.com/recipes/basic-homemade-bread/'],
    ['The Spruce Eats', 'https://www.thespruceeats.com/classic-southern-fried-chicken-3058647'],
    ['Love and Lemons', 'https://www.loveandlemons.com/chocolate-chip-cookies/'],
    ['Damn Delicious', 'https://damndelicious.net/2019/05/03/instant-pot-crack-chicken/']
  ];

  return parserName 
    ? sampleUrls.filter(([parser]) => parser === parserName)
    : sampleUrls;
}

function displayResults(results: ScrapingResult[]): void {
  const table = new Table({
    head: ['Parser', 'URL', 'Status', 'Duration', 'Errors', 'Warnings'],
    style: {
      head: ['cyan'],
      border: ['gray']
    }
  });

  results.forEach(result => {
    table.push([
      result.parserName,
      result.url,
      result.success ? chalk.green('✓') : chalk.red('✗'),
      `${result.duration}ms`,
      result.validationResult.errors.length,
      result.validationResult.warnings.length
    ]);
  });

  console.log(table.toString());

  // Display detailed errors if any
  results.forEach(result => {
    if (!result.success || result.validationResult.errors.length > 0) {
      console.log(chalk.red(`\nErrors for ${result.url}:`));
      result.validationResult.errors.forEach(error => {
        console.log(chalk.red(`- ${error.field}: ${error.message} (${error.code})`));
      });
    }
  });
}

function displayStats(stats: any, logs: ScrapingResult[]): void {
  if (!stats) {
    console.log(chalk.yellow('No statistics available'));
    return;
  }

  const table = new Table({
    head: ['Metric', 'Value'],
    style: {
      head: ['cyan'],
      border: ['gray']
    }
  });

  table.push(
    ['Total Attempts', stats.totalAttempts],
    ['Success Rate', `${stats.successRate.toFixed(2)}%`],
    ['Avg Duration', `${stats.averageDuration.toFixed(2)}ms`],
    ['Last Run', stats.lastRun.toLocaleString()]
  );

  console.log(table.toString());

  // Display common errors
  if (stats.commonErrors.length > 0) {
    console.log(chalk.yellow('\nCommon Errors:'));
    stats.commonErrors.forEach((error: any) => {
      console.log(`- ${error.code}: ${error.count} occurrences`);
    });
  }
}

async function sendResultsEmail(email: string, results: ScrapingResult[]): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  const html = `
    <h2>Recipe Scraper Test Results</h2>
    <p>Total Tests: ${results.length}</p>
    <p>Successes: ${successCount}</p>
    <p>Failures: ${failureCount}</p>
    
    <h3>Detailed Results:</h3>
    <table border="1" cellpadding="5">
      <tr>
        <th>Parser</th>
        <th>URL</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Errors</th>
      </tr>
      ${results.map(r => `
        <tr>
          <td>${r.parserName}</td>
          <td>${r.url}</td>
          <td>${r.success ? '✓' : '✗'}</td>
          <td>${r.duration}ms</td>
          <td>${r.validationResult.errors.length}</td>
        </tr>
      `).join('')}
    </table>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Recipe Scraper Test Results - ${new Date().toLocaleDateString()}`,
    html
  });
}

program.parse(); 